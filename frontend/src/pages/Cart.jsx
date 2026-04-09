import React, {useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const {products, currency, priceMultiplier, cartItems, updateQuantity, navigate } = useContext(ShopContext);

   const [cartData, setCartData] = useState([]);

    useEffect(()=>{
      if (products.length >0){
 const tempData = [];
    for(const items in cartItems){
        for (const item in cartItems[items]){
          if (cartItems[items][item]>0){
           tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item]
           })
          }
          }
    }
    setCartData(tempData);
      }
     
   },[cartItems, products])

  const changeQuantity = (itemId, size, delta) => {
    const currentQty = cartItems[itemId]?.[size] || 0;
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      updateQuantity(itemId, size, 0);
    } else {
      updateQuantity(itemId, size, nextQty);
    }
  };

  return (
    <div className='border-t pt-14 '>
      <div className='text-2xl mb-3 '>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);

          return (
            <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-1 sm:grid-cols-[4fr_2fr_1fr] items-center gap-4'>
              <div className='flex items-start gap-4'>
                <img src={productData.image[0]} alt='' className='w-16 sm:w-20 rounded-md object-cover' />
                <div>
                  <p className='text-sm sm:text-lg font-semibold'>{productData.name}</p>
                  <div className='flex sm:items-center flex-col sm:flex-row sm:gap-4 gap-1 mt-2'>
                    <p className='text-lg font-medium'>{currency} {productData.price * priceMultiplier}</p>
                    <p className='text-xs sm:text-sm px-2 py-1 border rounded-md bg-slate-50'>{item.size}</p>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-2 border border-yellow-400 rounded-lg px-2 py-1 bg-white shadow-sm max-w-[170px]'>
                  <button onClick={() => changeQuantity(item._id, item.size, -1)} className='text-lg font-bold leading-none text-gray-700 px-2 py-1 hover:text-black'>-</button>
                  <span className='px-3 text-base font-semibold'>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item._id, item.size, 1)} className='text-lg font-bold leading-none text-gray-700 px-2 py-1 hover:text-black'>+</button>
                </div>
                <button onClick={() => updateQuantity(item._id, item.size, 0)} className='text-red-500 hover:text-red-700 rounded-md border border-red-200 p-2'>
                  <img src={assets.bin_icon} alt='Remove' className='w-4 h-4' />
                </button>
              </div>
            </div>
          );
        })}
      </div>

       <div className='flex justify-end my-20'>
<div className='w-full sm:w-[450px]'>
    <CartTotal/>
    <div className='w-full text-end'>
<button onClick={()=> navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3 '>PROCEED TO CHECKOUT</button>
    </div>
</div>
       </div>

    </div>
  )
}

export default Cart
