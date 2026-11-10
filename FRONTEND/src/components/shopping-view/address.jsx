import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Plus, ArrowDown, RefreshCw, AlertCircle } from "lucide-react";
import CommonForm from "../common/form";
import { addressFormControls } from "@/config";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";
import { useAccountReveal } from "@/hooks/use-account-reveal";
import { useReducedMotion } from "@/hooks/use-media-query";
import "@/account-editorial.css";

const deliveryControls = addressFormControls.map((control) =>
  control.name === "phone"
    ? { ...control, type: "tel" }
    : control.name === "pincode"
      ? { ...control, label: "Postal code" }
      : control.name === "address"
        ? { ...control, label: "Street address" }
        : control.name === "notes"
          ? {
              ...control,
              label: "Delivery notes",
              placeholder: "Building name, floor or arrival instructions",
            }
          : control,
);
const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};
export default function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const root = useRef(null);
  const editor = useRef(null);
  const focusEditor = useRef(false);
  const editorOpener = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList = [] } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();
  const reduced = useReducedMotion();
  const addresses = Array.isArray(addressList) ? addressList : [];
  const showEditor = formOpen || (!loading && !error && !addresses.length);
  useAccountReveal(
    root,
    `${loading}-${error}-${addresses.length}-${showEditor}`,
  );

  useEffect(() => {
    if (!user?.id) return;
    let current = true;
    setLoading(true);
    setError(false);
    dispatch(fetchAllAddresses(user.id)).then((result) => {
      if (current) {
        setLoading(false);
        setError(!result?.payload?.success);
      }
    });
    return () => {
      current = false;
    };
  }, [dispatch, user?.id, refresh]);
  useEffect(() => {
    if (!showEditor || !focusEditor.current) return;
    focusEditor.current = false;
    editor.current?.scrollIntoView({
      block: "nearest",
      behavior: reduced ? "auto" : "smooth",
    });
    editor.current?.querySelector("input")?.focus({ preventScroll: true });
  }, [showEditor, currentEditedId, reduced]);

  function openEditor(address = null, event) {
    if (event) editorOpener.current = event.currentTarget;
    focusEditor.current = true;
    if (editor.current) {
      editor.current.scrollIntoView({
        block: "nearest",
        behavior: reduced ? "auto" : "smooth",
      });
      editor.current.querySelector("input")?.focus({ preventScroll: true });
      focusEditor.current = false;
    }
    setCurrentEditedId(address?._id || null);
    setFormData(
      address
        ? Object.fromEntries(
            Object.keys(initialAddressFormData).map((key) => [
              key,
              address[key] || "",
            ]),
          )
        : initialAddressFormData,
    );
    setFormOpen(true);
  }
  function cancel() {
    setCurrentEditedId(null);
    setFormData(initialAddressFormData);
    setFormOpen(false);
    if (editorOpener.current?.isConnected)
      editorOpener.current.focus({ preventScroll: true });
  }
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    if (addresses.length >= 3 && currentEditedId === null) {
      toast({
        title: "Your address book holds up to three addresses",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const result = await dispatch(
      currentEditedId
        ? editaAddress({
            userId: user.id,
            addressId: currentEditedId,
            formData,
          })
        : addNewAddress({ ...formData, userId: user.id }),
    );
    if (result?.payload?.success) {
      // Keep checkout's selected address in sync when its details are edited.
      if (currentEditedId === selectedId?._id)
        setCurrentSelectedAddress?.({ ...selectedId, ...formData });
      const refreshed = await dispatch(fetchAllAddresses(user.id));
      setError(!refreshed?.payload?.success);
      toast({
        title: currentEditedId
          ? "Delivery details updated"
          : "Address saved to your book",
      });
      cancel();
    } else
      toast({
        title: "We couldn't save these details. Please try again.",
        variant: "destructive",
      });
    setSaving(false);
  }
  async function remove(address) {
    if (deletingId || saving) return;
    setDeletingId(address._id);
    const result = await dispatch(
      deleteAddress({ userId: user.id, addressId: address._id }),
    );
    if (result?.payload?.success) {
      if (selectedId?._id === address._id) setCurrentSelectedAddress?.(null);
      if (currentEditedId === address._id) cancel();
      const refreshed = await dispatch(fetchAllAddresses(user.id));
      setError(!refreshed?.payload?.success);
      toast({ title: "Address removed from your book" });
    } else
      toast({
        title: "This address couldn't be removed. Please try again.",
        variant: "destructive",
      });
    setDeletingId(null);
  }
  const valid = Object.keys(initialAddressFormData).every((key) =>
    String(formData[key] || "").trim(),
  );
  return (
    <section
      className="address-book address-studio"
      ref={root}
      aria-labelledby="address-book-title"
    >
      <div className="account-panel-heading" data-account-reveal>
        <div>
          <p className="eyebrow">02 / THE PLACES YOU CALL YOURS</p>
          <h2 id="address-book-title">
            A place for
            <br />
            <em>your next piece.</em>
          </h2>
          <p>Keep up to three delivery addresses close at hand.</p>
        </div>
        <span className="account-heading-mark" aria-hidden="true">
          <MapPin size={29} strokeWidth={1} />
        </span>
      </div>
      <div className="address-book-toolbar">
        <span>
          {loading
            ? "Opening your address book..."
            : error
              ? "YOUR ADDRESS BOOK"
              : `${addresses.length} / 3 SAVED ADDRESSES`}
        </span>
        <button
          onClick={(event) => openEditor(null, event)}
          disabled={
            loading || error || addresses.length >= 3 || saving || !!deletingId
          }
        >
          <Plus size={15} />
          New address
        </button>
      </div>
      {loading ? (
        <div className="account-order-skeleton" role="status">
          <span className="sr-only">Loading your delivery addresses</span>
          <div />
          <div />
          <div />
        </div>
      ) : error ? (
        <div className="account-state account-error" role="alert">
          <AlertCircle size={30} strokeWidth={1} />
          <h3>A brief interruption.</h3>
          <p>Your address book couldn't be loaded.</p>
          <button
            className="account-primary-action"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Try again <RefreshCw size={16} />
          </button>
        </div>
      ) : (
        <>
          {addresses.length ? (
            <div className="saved-addresses">
              {addresses.map((address, index) => (
                <AddressCard
                  key={address._id}
                  index={index}
                  selectedId={selectedId}
                  addressInfo={address}
                  handleDeleteAddress={remove}
                  handleEditAddress={openEditor}
                  setCurrentSelectedAddress={setCurrentSelectedAddress}
                  deleting={deletingId === address._id}
                  busy={saving || !!deletingId}
                />
              ))}
            </div>
          ) : (
            <div className="address-book-empty" data-account-reveal>
              <MapPin size={30} strokeWidth={1} />
              <div>
                <h3>Where should the next chapter arrive?</h3>
                <p>Save your first delivery address below.</p>
              </div>
              <ArrowDown size={20} />
            </div>
          )}
          {addresses.length >= 3 && !showEditor && (
            <p className="address-capacity-note">
              Your address book is full. Edit an existing address or remove one
              to add another.
            </p>
          )}
          {showEditor && (
            <div ref={editor} className="address-editor" data-account-reveal>
              <div className="address-editor-heading">
                <span className="eyebrow">
                  {currentEditedId
                    ? "A CHANGE OF DETAILS"
                    : "A NEW DESTINATION"}
                </span>
                <h3>
                  {currentEditedId
                    ? "Make yourself at home."
                    : "Let's make it yours."}
                </h3>
                <p>
                  {currentEditedId
                    ? "Update the delivery details for this address."
                    : "Add the details we'll need to deliver your pieces."}{" "}
                  All fields are required.
                </p>
              </div>
              <fieldset
                disabled={saving}
                className="address-editor-fields"
                aria-label="Delivery address details"
              >
                <CommonForm
                  formControls={deliveryControls}
                  formData={formData}
                  setFormData={setFormData}
                  buttonText={
                    saving
                      ? "Saving your details..."
                      : currentEditedId
                        ? "Save changes"
                        : "Save delivery address"
                  }
                  onSubmit={save}
                  isBtnDisabled={!valid || !!deletingId}
                  isSubmitting={saving}
                  autoCompleteMap={{
                    address: "street-address",
                    city: "address-level2",
                    phone: "tel",
                    pincode: "postal-code",
                  }}
                />
              </fieldset>
              {(currentEditedId || addresses.length > 0) && (
                <button
                  type="button"
                  className="address-editor-cancel"
                  disabled={saving}
                  onClick={cancel}
                >
                  Cancel changes
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
