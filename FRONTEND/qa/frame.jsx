/* Local development-only fixtures. Not imported by the storefront or production build. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import axios from 'axios';
import store from '../src/store/store';
import App from '../src/App';
import '../src/index.css';
import '../src/storefront.css';
import { Toaster } from '../src/components/ui/toaster';
import { Sheet } from '../src/components/ui/sheet';
import Cart from '../src/components/shopping-view/cart-wrapper';
import { Dialog } from '../src/components/ui/dialog';
import OrderDetails from '../src/components/shopping-view/order-details';
import catalog from './catalog.json';
const params = new URLSearchParams(location.search);
const scene = params.get('scene') || 'home';
const products = catalog.map(p => ({...p, description: 'QA catalog snapshot: inspect the actual garment photograph and its silhouette.'}));
const user = { id:'qa-customer', userName:'Studio Guest', role:'user' };
let items = /empty/.test(scene) ? [] : products.slice(0,2).map(p => ({...p, productId:p._id, quantity:1}));
let addresses = [{_id:'qa-address',address:'12 Sample Lane',city:'Test City',pincode:'00000',phone:'0000000000',notes:'Local preview fixture'}];
const order = {_id:'QA-ORDER-001',orderDate:'2026-11-09T12:00:00Z',orderStatus:'confirmed',paymentStatus:'paid',paymentMethod:'paypal',totalAmount:14998,cartItems:items,addressInfo:addresses[0]};
const log = []; const errors = []; let cls = 0;
new PerformanceObserver(list => { for(const entry of list.getEntries()) if(!entry.hadRecentInput) cls += entry.value; }).observe({type:'layout-shift',buffered:true});
window.addEventListener('error', e => errors.push(e.message));
window.addEventListener('unhandledrejection', e => errors.push(String(e.reason)));
window.fetch = async () => { throw new Error('External fetch is disabled in the QA harness.'); };
navigator.sendBeacon = () => false;
axios.defaults.adapter = async config => {
  const url = new URL(config.url); const path = url.pathname; const body = config.data ? JSON.parse(config.data) : {}; log.push({method:config.method,path,body});
  let data = {success:true,data:[]};
  if(path.includes('check-auth')) data = {success:!['login','register','guest'].includes(scene),user};
  else if(path.includes('/auth/')) data = {success:false,message:'QA fixture: authentication error state'};
  else if(path.includes('/products/get/')) data.data = products.find(p => p._id === path.split('/').pop()) || products[0];
  else if(path.endsWith('/products/get')) {
    data.data = products.filter(p => (!url.searchParams.get('category') || url.searchParams.get('category').split(',').includes(p.category)) && (!url.searchParams.get('brand') || url.searchParams.get('brand').split(',').includes(p.brand)));
    const sort = url.searchParams.get('sortBy'); if(sort?.includes('price')) data.data.sort((a,b) => sort === 'price-lowtohigh' ? a.price-b.price : b.price-a.price); else if(sort?.startsWith('title')) data.data.sort((a,b) => sort === 'title-atoz' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
  } else if(path.includes('/search/')) data.data = products.filter(p => p.title.toLowerCase().includes(decodeURIComponent(path.split('/').pop()).toLowerCase()));
  else if(path.includes('/review/')) data.data = [];
  else if(path.includes('/cart/')) {
    if(config.method === 'post') { const item = items.find(i => i.productId === body.productId); if(item) item.quantity += body.quantity; else {const p=products.find(p=>p._id===body.productId);items.push({...p,productId:p._id,quantity:body.quantity});} }
    if(config.method === 'put') items = items.map(i=>i.productId===body.productId ? {...i,quantity:body.quantity} : i);
    if(config.method === 'delete') items=items.filter(i=>i.productId!==path.split('/').pop());
    data.data={_id:'qa-bag',items:structuredClone(items)};
  } else if(path.includes('/address/')) { if(config.method==='post') addresses.push({...body,_id:'qa-new-address'}); if(config.method==='put') addresses=addresses.map(a=>a._id===path.split('/').pop()?{...a,...body}:a); if(config.method==='delete') addresses=addresses.filter(a=>a._id!==path.split('/').pop()); data.data=structuredClone(addresses); }
  else if(path.includes('/order/create')) data={success:true,orderId:'qa-new-order'};
  else if(path.includes('/order/capture')) { if(scene==='paymentpending') return new Promise(()=>{}); data={success:false,message:'QA fixture: payment cannot be confirmed'}; }
  else if(path.includes('/order/details')) data.data=order;
  else if(path.includes('/order/list')) data.data=scene==='accountempty'?[]:[order];
  else if(path.includes('/tryon/')) data.data=products.slice(0,3).map(p=>({_id:p._id,image:p.image}));
  return {data:structuredClone(data),status:200,statusText:'OK',headers:{},config};
};
const routes = {home:'/shop/home',collection:'/shop/listing',empty:'/shop/listing?category=men',search:'/shop/search?keyword=Mauve',searchEmpty:'/shop/search?keyword=zzzzzz',product:'/shop/listing',cart:'/shop/home',emptycart:'/shop/home',account:'/shop/account',accountempty:'/shop/account',order:'/shop/account',checkout:'/shop/checkout',emptycheckout:'/shop/checkout',login:'/auth/login',register:'/auth/register',tryon:`/shop/tryon/${products[0]._id}`,pro:`/shop/tryon-youcam/${products[0]._id}`,paymentpending:'/shop/paypal-return',paymentfailed:'/shop/paypal-return',success:'/shop/payment-success',notfound:'/missing',unauth:'/unauth-page'};
if(scene==='product') store.dispatch({type:'/products/fetchProductDetails/fulfilled',payload:{data:products[0]}});
function Preview() { return <Provider store={store}><MemoryRouter initialEntries={[routes[scene] || routes.home]}><App/>{['cart','emptycart'].includes(scene)&&<Sheet open><Cart cartItems={items} setOpenCartSheet={()=>{}}/></Sheet>}{scene==='order'&&<Dialog open><OrderDetails orderDetails={order}/></Dialog>}<Toaster/></MemoryRouter></Provider>; }
createRoot(document.getElementById('root')).render(<Preview/>);
window.qa = { log, report: () => {
  const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const dialog = document.querySelector('[role=dialog]');
  const scope = dialog || document.querySelector('main') || document.body;
  const overflow = [...scope.querySelectorAll('*')].filter(el=>visible(el) && el.getBoundingClientRect().right > innerWidth+2 && !el.closest('.overflow-auto,.overflow-y-auto,.overflow-x-auto,.gallery-stage')).slice(0,10).map(el=>`${el.tagName}.${el.className}`);
  const unnamed = [...scope.querySelectorAll('button,input:not([type=hidden]),select,textarea')].filter(el=>visible(el)&&!el.textContent.trim()&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')&&!el.labels?.length&&!el.getAttribute('placeholder')).map(el=>el.outerHTML.slice(0,160));
  return {scene,width:innerWidth,height:innerHeight,documentOverflow:document.documentElement.scrollWidth>innerWidth+2,overflow,unnamed,errors:[...errors],cls:Math.round(cls*10000)/10000,images:[...document.images].filter(img=>img.complete&&!img.naturalWidth).map(img=>img.alt),heading:document.querySelector('h1')?.textContent,requests:log.length};
}};
setTimeout(()=>parent.postMessage({type:'luxar-qa',report:window.qa.report()},location.origin),2000);
