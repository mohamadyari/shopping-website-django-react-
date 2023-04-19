import React, { useState, useEffect } from 'react'
import { Row, Col, Form, Button, Table } from 'react-bootstrap'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { useSelector, useDispatch } from 'react-redux'
import { getUserDetailsAction, updateUserProfileAction, userLogoutAction } from '../actions/userActions'
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'
import { LinkContainer } from 'react-router-bootstrap'
import { getMyOrderList } from '../actions/orderActions'


function ProfileScreen({ history }) {
    const dispatch = useDispatch()

    // local states
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [successUpdate, setSuccessUpdate] = useState('')

    // handle getUserDetails
    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin


    const userDetails = useSelector(state => state.userDetails)
    const { user, error: errorUserDetails, loading: loadingUserDetails } = userDetails


    const userUpdateProfile = useSelector(state => state.userUpdateProfile)
    const { success, error: errorUpdateProfile, loading: loadingUpdateProfile } = userUpdateProfile


    // handle getMyOrderList
    const orderListMy = useSelector(state => state.orderListMy)
    const { orders, error: errorOrders, loading: loadingOrders } = orderListMy


    // handle loading and error
    let loading = false
    let error = ''

    if (loadingUserDetails || loadingUpdateProfile) {
        loading = true
    }

    if (errorUserDetails) {
        error = errorUserDetails
    } else if (errorUpdateProfile) {
        error = errorUpdateProfile
    }

    const TE = "Token is invalid or expired"



    useEffect(() => {
        if (errorUserDetails === TE || errorUpdateProfile === TE) {
            dispatch(userLogoutAction())
            history.push('/login?redirect=/profile')
        }
        if (!userInfo) {
            history.push('/login')
        } else {
            if (!user || !user.name || success) {
                dispatch({ type: USER_UPDATE_PROFILE_RESET })
                dispatch(getUserDetailsAction('profile'))
                dispatch(getMyOrderList())
            } else {
                setEmail(user.email)
                setName(user.name)
            }
        }
    }, [history, userInfo, user, dispatch, success, errorUserDetails, errorUpdateProfile])

    const submitHandler = (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage('Passwords do not match !')
        } else {
            dispatch(updateUserProfileAction({
                'id': user._id,
                'name': name,
                'email': email,
                'password': password
            }))
            setMessage('')
            setPassword('')
            setConfirmPassword('')
            setSuccessUpdate('Profile successfully updated !')
        }
    }
    return (
        <Row>
            <Col md={3}>
                <h2>my profile</h2>
                {
                    loading ? <Loader />
                        : error ? <Message variant='danger' text={error} />
                            : message ? <Message variant='danger' text={message} />
                                : successUpdate ? <Message variant='success' text={successUpdate} />
                                    : <></>
                }
                <Form onSubmit={submitHandler}>
                    <Form.Group controlId='name'>
                        <Form.Label>FullName</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder='Enter FullName'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group className='mt-4' controlId='email'>
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            type='email'
                            placeholder='Enter Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group className='mt-4' controlId='password'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder='Enter Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group className='mt-4' controlId='confirmPassword'>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder='Enter Confirm Password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Button
                        type='submit'
                        className='my-4 col-6'
                        disabled={loading === true}
                    >
                        update
                    </Button>
                </Form>
            </Col>
            <Col md={9}>
                <h2>my orders</h2>
                {
                    loadingOrders ? (
                        <Loader />
                    ) : errorOrders ? (
                        <Message variant='danger' text={errorOrders} />
                    ) : orders && orders.length === 0 ? (
                        <Message variant='warning' text='There is no any order !' />
                    ) : (
                        <Table striped responsive className='table-sm text-center'>
                            <thead>
                                <tr>
                                    <th>id</th>
                                    <th>date</th>
                                    <th>total</th>
                                    <th>paid</th>
                                    <th>delivered</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    orders.map(order => (
                                        <tr
                                            key={order._id}
                                            className={order.isPaid && order.isDelivered ? 'bg-success text-white' : ''}
                                        >
                                            <td>#{order._id}</td>
                                            <td>{order.createdAt.substring(0, 10)}</td>
                                            <td>$ {order.totalPrice}</td>
                                            <td>
                                                {
                                                    order.isPaid ?
                                                        order.paidAt.substring(0, 10) : (
                                                            <i className='fas fa-times text-danger'></i>
                                                        )
                                                }
                                            </td>
                                            <td>
                                                {
                                                    order.isDelivered ?
                                                        order.deliveredAt.substring(0, 10) : (
                                                            <i className='fas fa-times text-danger'></i>
                                                        )
                                                }
                                            </td>
                                            <td>
                                                <LinkContainer to={`/order/${order._id}`}>
                                                    <Button
                                                        className='btn-sm'
                                                    >
                                                        details
                                                    </Button>
                                                </LinkContainer>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                    )
                }
            </Col>
        </Row>
    )
}

export default ProfileScreen