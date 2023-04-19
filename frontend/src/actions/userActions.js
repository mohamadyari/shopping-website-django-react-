import {
    USER_LOGIN_REQUEST,
    USER_LOGIN_SUCCESS,
    USER_LOGIN_FAIL,

    USER_LOGOUT,

    USER_REGISTER_REQUEST,
    USER_REGISTER_SUCCESS,
    USER_REGISTER_FAIL,

    USER_DETAILS_REQUEST,
    USER_DETAILS_SUCCESS,
    USER_DETAILS_FAIL,
    USER_DETAILS_RESET,

    USER_UPDATE_PROFILE_REQUEST,
    USER_UPDATE_PROFILE_SUCCESS,
    USER_UPDATE_PROFILE_FAIL,
} from '../constants/userConstants'

import { ORDER_LIST_MY_RESET } from '../constants/orderConstants'

import axios from 'axios'
import axiosInstance from '../utils/axiosInstance'


export const userLoginAction = (email, password) => async (dispatch) => {
    try {
        dispatch({// USER_LOGIN_REQUEST
            type: USER_LOGIN_REQUEST,
        })

        const config = {// request setting
            header: {
                'Content-type': 'application/json'
            }
        }

        const { data } = await axios.post(// send request login
            '/api/v1/users/login/',
            { 'username': email, 'password': password },
            config,
        )

        dispatch({// USER_LOGIN_SUCCESS
            type: USER_LOGIN_SUCCESS,
            payload: data
        })

        localStorage.setItem(// save user information in local storage
            'userInfo',
            JSON.stringify(data)
        )

    } catch (error) {
        dispatch({// USER_LOGIN_FAIL
            type: USER_LOGIN_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }

}


export const userLogoutAction = () => (dispatch) => {
    localStorage.removeItem('userInfo')
    dispatch({ type: USER_LOGOUT })
    dispatch({ type: USER_DETAILS_RESET })
    dispatch({ type: ORDER_LIST_MY_RESET })
}


export const userRegisterAction = (name, email, password) => async (dispatch) => {
    try {
        dispatch({ // USER_REGISTER_REQUEST
            type: USER_REGISTER_REQUEST,
        })

        const config = {// request setting
            header: {
                'Content-type': 'application/json'
            }
        }

        const { data } = await axios.post(// register request
            '/api/v1/users/register/',
            { 'name': name, 'email': email, 'password': password },
            config
        )

        dispatch({// USER_REGISTER_SUCCESS
            type: USER_REGISTER_SUCCESS,
            payload: data
        })



    } catch (error) {
        dispatch({// USER_REGISTER_FAIL
            type: USER_REGISTER_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}


export const getUserDetailsAction = (id) => async (dispatch, getState) => {
    try {
        dispatch({// USER_DETAILS_REQUEST
            type: USER_DETAILS_REQUEST
        })

        const { userLogin: { userInfo } } = getState()

        const authRequestAxios = axiosInstance(userInfo, dispatch)
        const { data } = await authRequestAxios.get(
            `/api/v1/users/${id}`,
        )

        dispatch({// USER_DETAILS_SUCCESS
            type: USER_DETAILS_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({// USER_DETAILS_FAIL
            type: USER_DETAILS_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}


export const updateUserProfileAction = (user) => async (dispatch, getState) => {
    try {
        dispatch({// USER_UPDATE_PROFILE_REQUEST
            type: USER_UPDATE_PROFILE_REQUEST
        })

        const { userLogin: { userInfo } } = getState()


        const authRequestAxios = axiosInstance(userInfo, dispatch)
        const { data } = await authRequestAxios.put(// send update profile request
            '/api/v1/users/profile/update/',
            user,
        )
        userInfo.name = data.name

        dispatch({// USER_UPDATE_PROFILE_SUCCESS
            type: USER_UPDATE_PROFILE_SUCCESS,
            payload: userInfo
        })

        dispatch({// USER_LOGIN_SUCCESS
            type: USER_LOGIN_SUCCESS,
            payload: userInfo
        })

        localStorage.setItem('userInfo', JSON.stringify(userInfo))
    } catch (error) {
        dispatch({// USER_UPDATE_PROFILE_FAIL
            type: USER_UPDATE_PROFILE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}


export const updateAccessToken = (obj) => (dispatch, getState) => {
    const { userLogin: { userInfo } } = getState()

    userInfo.access = obj.access
    userInfo.refresh = obj.refresh

    dispatch({ type: USER_LOGIN_SUCCESS, payload: userInfo })
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
}






