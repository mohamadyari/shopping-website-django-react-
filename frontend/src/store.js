import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { listProductReducer, detailsProductReducer } from './reducers/productReducers'
import { cartReducer } from './reducers/cartReducers'
import { userLoginReducer, userRegisterReducer, userDetailsReducer, userUpdateProfileReducer } from './reducers/userReducers'
import { orderCreateReducer, orderDetailsReducer, orderListMyReducer } from './reducers/orderReducers'

const reducer = combineReducers({
    listProduct: listProductReducer,
    productDetails: detailsProductReducer,
    cart: cartReducer,
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
    userDetails: userDetailsReducer,
    userUpdateProfile: userUpdateProfileReducer,
    orderCreate: orderCreateReducer,
    orderDetails: orderDetailsReducer,
    orderListMy: orderListMyReducer
})

const cartFromLocalStorage = localStorage.getItem('cartItems') ?
    JSON.parse(localStorage.getItem('cartItems')) : []

const userInfoFromLocalStorage = localStorage.getItem('userInfo') ?
    JSON.parse(localStorage.getItem('userInfo')) : null

const shippingAddressFromLocalStorage = localStorage.getItem('shippingAddress') ?
    JSON.parse(localStorage.getItem('shippingAddress')) : {}

const paymentMethodFromLocalStorage = localStorage.getItem('paymentMethod') ?
    JSON.parse(localStorage.getItem('paymentMethod')) : {}

const initialState = {
    cart: {
        cartItems: cartFromLocalStorage,
        shippingAddress: shippingAddressFromLocalStorage,
        paymentMethod: paymentMethodFromLocalStorage,
    },
    userLogin: { userInfo: userInfoFromLocalStorage }
}
const middleware = [thunk]

const store = createStore(reducer, initialState,
    composeWithDevTools(applyMiddleware(...middleware)))


export default store