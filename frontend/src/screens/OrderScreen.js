import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getOrderDetails } from '../actions/orderActions'
import { Row, Col, Button, Image, ListGroup, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { goPayGate } from '../actions/orderActions'
import axiosInstance from '../utils/axiosInstance'


function OrderScreen({ match }) {
  const orderId = match.params.id
  const dispatch = useDispatch()
  const orderDetails = useSelector(state => state.orderDetails)
  const { order, error, loading } = orderDetails

  if (!loading && !error) {
    order.itemsPrice = order.orderItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)
  }

  useEffect(() => {
    if (!order || order._id !== Number(orderId)) {
      dispatch(getOrderDetails(orderId))
    }
  }, [order, orderId, dispatch])


  // handle pay order

  const [payGateMessage, setPayGateMessage] = useState('')

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  const authRequestAxios = axiosInstance(userInfo, dispatch)

  const payOrderHandler = () => {
    goPayGate(authRequestAxios, orderId)
      .then((response) => {
        window.location.assign(response.data.link)
      })
      .catch((error) => {
        if (error.response.data && error.response.data.detail) {
          setPayGateMessage(error.response.data.detail)
        } else {
          setPayGateMessage(error.response.data)
        }
      })
  }


  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger' text={error} />
  ) : (
    <div>
      <h1>order: #{order._id}</h1>
      <hr />

      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>shipping</h2>
              <p><strong>Name: </strong>{order.user.name}</p>
              <p><strong>Email: </strong><a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
              <p>
                <strong>Shipping: </strong>
                {order.shippingAddress.country} -
                {' '}
                {order.shippingAddress.city} -
                {' '}
                {order.shippingAddress.address} /
                Postal Code: {order.shippingAddress.postalCode}
              </p>

              {
                order.isDelivered ? (
                  <Message
                    variant='success'
                    text={`Delivered on ${order.deliveredAt}`}
                  />
                ) : (
                  <Message
                    variant='warning'
                    text='Not delivered'
                  />
                )
              }
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>payment method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {
                order.isPaid ? (
                  <Message
                    variant='success'
                    text={`Paid on ${order.paidAt}`}
                  />
                ) : (
                  <Message
                    variant='warning'
                    text='Not paid'
                  />
                )
              }
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>order items</h2>
              {
                order.orderItems.length === 0
                  ? <Message variant='info' text='Your order is empty !' />
                  : (
                    <ListGroup variant='flush'>
                      {order.orderItems.map((item, index) => (
                        <ListGroup.Item>
                          <Row>
                            <Col md={2} className='my-auto'>
                              <Image src={item.image} alt={item.name} fluid />
                            </Col>
                            <Col className='my-auto'>
                              <Link to={`/product/${item.product}`}>{item.name}</Link>
                            </Col>
                            <Col md={4} className='my-auto'>
                              {item.qty} X {item.price} = $ {(item.price * item.qty).toFixed(2)}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>

          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>order summary</h2>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Items: </Col>
                  <Col>$ {order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Shipping: </Col>
                  <Col>$ {order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Tax: </Col>
                  <Col>$ {order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Total: </Col>
                  <Col>$ {order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item
                className={payGateMessage ? '' : 'd-none'}
              >
                <Message variant='danger' text={payGateMessage} />
              </ListGroup.Item>

              <ListGroup.Item
                className={order.isPaid ? 'd-none' : ''}
              >
                <Button
                  type='button'
                  onClick={payOrderHandler}
                >pay order</Button>
              </ListGroup.Item>
            </ListGroup>


          </Card>

        </Col>
      </Row>
    </div>
  )
}

export default OrderScreen