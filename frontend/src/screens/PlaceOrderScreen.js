import React, { useEffect } from 'react'
import { Row, Col, Button, Image, ListGroup, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import CheckoutSteps from '../components/CheckoutSteps'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { useSelector, useDispatch } from 'react-redux'
import { createOrder } from '../actions/orderActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'


function PlaceOrderScreen({ history }) {

    const dispatch = useDispatch()

    const orderCreate = useSelector(state => state.orderCreate)
    const { success, order, error, loading } = orderCreate

    const cart = useSelector(state => state.cart)

    cart.itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)
    cart.shippingPrice = (cart.itemsPrice > 100 ? 0 : 10).toFixed(2)
    cart.taxPrice = Number((0.082) * cart.itemsPrice).toFixed(2)
    cart.totalPrice = (Number(cart.itemsPrice) + Number(cart.shippingPrice) + Number(cart.taxPrice)).toFixed(2)


    useEffect(() => {
        if (success) {
            history.push(`/order/${order._id}`)
            dispatch({ type: ORDER_CREATE_RESET })
        }
    }, )



    const placeOrder = () => {
        dispatch(createOrder({
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
        }))
    }

    return (
        <div>
            <CheckoutSteps step1 step2 step3 step4 />

            <Row>
                <Col md={8}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>shipping</h2>
                            <p>
                                <strong>Shipping: </strong>
                                {cart.shippingAddress.country} -
                                {' '}
                                {cart.shippingAddress.city} -
                                {' '}
                                {cart.shippingAddress.address} /
                                Postal Code: {cart.shippingAddress.postalCode}
                            </p>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>payment method</h2>
                            <p>
                                <strong>Method: </strong>
                                {cart.paymentMethod}
                            </p>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>order items</h2>
                            {
                                cart.cartItems.length === 0
                                    ? <Message variant='info' text='Your cart is empty !' />
                                    : (
                                        <ListGroup variant='flush'>
                                            {cart.cartItems.map((item, index) => (
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
                                    <Col>$ {cart.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping: </Col>
                                    <Col>$ {cart.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax: </Col>
                                    <Col>$ {cart.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Total: </Col>
                                    <Col>$ {cart.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            {
                                loading ?
                                    <ListGroup.Item>
                                        <Loader />
                                    </ListGroup.Item>
                                    : error ?
                                        <ListGroup.Item>
                                            <Message variant='danger' text={error} />
                                        </ListGroup.Item>
                                        : <></>
                            }
                            <ListGroup.Item>
                                <Button
                                    type='button'
                                    onClick={placeOrder}
                                    disabled={cart.cartItems.length === 0}
                                    className='btn-block'>Place Order</Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                </Col>
            </Row>
        </div>
    )
}

export default PlaceOrderScreen