import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { inquiryPayResult } from '../actions/payActions'
import axiosInstance from '../utils/axiosInstance'
import FormContainer from '../components/FormContainer'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { Row, Col, Button, ListGroup } from 'react-bootstrap'

function PayResultScreen({ match, history }) {

    const [success, setSuccess] = useState(false)
    const [serverMsg, setServerMsg] = useState('')
    const [serverStatus, setServerStatus] = useState('')
    const [serverTrackId, setServerTrackId] = useState('')
    const [serverOrderId, setServerOrderId] = useState('')
    const [serverError, setServerError] = useState('')



    const orderId = match.params.oid
    const trackId = match.params.trackId
    const transId = match.params.transId

    const payInq = {
        'transId': transId,
        'track_id': trackId
    }

    const dispatch = useDispatch()
    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin
    const authRequestAxios = axiosInstance(userInfo, dispatch)
    useEffect(() => {
        inquiryPayResult(authRequestAxios, orderId, payInq)
            .then((response) => {
                // console.log(response.data)
                const data = response.data
                if (data.success) {
                    setSuccess(true)
                }

                setServerMsg(data.message)
                setServerOrderId(data.order_id)
                setServerStatus(data.status)
                setServerTrackId(data.track_id)
            })
            .catch((error) => {
                if (error.response && error.response.data.detail) {
                    setServerError(error.response.data.detail)
                } else {
                    setServerError(error.message)
                }
            })
    })


    const goOrder = () => {
        if (serverOrderId) {
            history.push(`/order/${serverOrderId}`)
        }
    }
    return (
        <div>
            {!serverError && !serverMsg ? <Loader />
                : serverError ? <Message variant='danger' text={serverError} />
                    : (
                        <FormContainer>
                            <ListGroup variant='flush' className='text-center'>
                                <ListGroup.Item>
                                    <h2 className={!success ? 'text-danger' : 'text-success'}>
                                        {
                                            success ? "Transaction success" : "Transaction fail"
                                        }
                                    </h2>
                                    <small>{serverMsg}</small>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Status Code</Col>
                                        <Col>{serverStatus}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Track IDPAY</Col>
                                        <Col>{serverTrackId}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Order NO</Col>
                                        <Col>{serverOrderId}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Button
                                        onClick={goOrder}
                                    >
                                        order details
                                    </Button>
                                </ListGroup.Item>
                            </ListGroup>
                        </FormContainer>
                    )
            }
        </div>
    )
}

export default PayResultScreen