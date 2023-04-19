import jwt_decode from 'jwt-decode';
import dayjs from 'dayjs';
import axios from 'axios';
import { updateAccessToken } from '../actions/userActions';



const baseURL = 'http://127.0.0.1:8000'
const axiosInstance = (userInfo, dispatch) => {

    const instance = axios.create({
        baseURL,
        headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${userInfo?.access}`
        }
    })


    instance.interceptors.request.use(async req => {
        const user = jwt_decode(userInfo.access)
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 5000;

        if (!isExpired) return req

        const response = await axios.post(
            '/api/v1/users/token/refresh/',
            { refresh: userInfo.refresh },
        )

        dispatch(updateAccessToken(response.data))
        req.headers.Authorization = `Bearer ${response.data.access}`
        return req
    })



    return instance
}

export default axiosInstance;