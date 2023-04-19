import {
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,

    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,

    ORDER_LIST_MY_REQUEST,
    ORDER_LIST_MY_SUCCESS,
    ORDER_LIST_MY_FAIL,
} from '../constants/orderConstants'

import { CART_CLEAR_ITEMS } from '../constants/cartConstatns'

import axiosInstance from '../utils/axiosInstance'


export const createOrder = (order) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_CREATE_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const authRequestAxios = axiosInstance(userInfo, dispatch)

        const { data } = await authRequestAxios.post(
            '/api/v1/orders/add/',
            order
        )

        dispatch({ type: ORDER_CREATE_SUCCESS, payload: data })

        dispatch({ type: CART_CLEAR_ITEMS })

        localStorage.removeItem('cartItems')
    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}


export const getOrderDetails = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_DETAILS_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const authRequestAxios = axiosInstance(userInfo, dispatch)

        const { data } = await authRequestAxios.get(
            `/api/v1/orders/${id}/`
        )

        dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data })

    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}


export const getMyOrderList = () => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_LIST_MY_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const authRequestAxios = axiosInstance(userInfo, dispatch)

        const { data } = await authRequestAxios.get(
            '/api/v1/orders/my/',
        )

        dispatch({ type: ORDER_LIST_MY_SUCCESS, payload: data })
    } catch (error) {
        dispatch({
            type: ORDER_LIST_MY_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}


export const goPayGate = (authRequestAxios, id) => {

    const response = authRequestAxios.get(
        `/api/v1/orders/${id}/pay/`,
    )
    return response
}