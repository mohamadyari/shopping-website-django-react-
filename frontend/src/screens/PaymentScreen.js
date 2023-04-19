import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import { useDispatch, useSelector } from 'react-redux'
import { savePaymentMethod } from '../actions/cartActions'
import CheckoutSteps from '../components/CheckoutSteps'


function PaymentScreen({ history }) {

    const dispatch = useDispatch()
    const [paymentMethod, setPaymentMethod] = useState('IdPay')
    const cart = useSelector(state => state.cart)
    const { shippingAddress } = cart

    if (!shippingAddress.address) {
        history.push('/shipping')
    }

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(savePaymentMethod(paymentMethod))
        history.push('/placeorder')
    }

    return (
        <FormContainer>
            <CheckoutSteps step1 step2 step3 />

            <Form onSubmit={submitHandler}>
                <Form.Group>
                    <Form.Label as='legend'>Select Method</Form.Label>
                    <Form.Check
                        name='paymentMethod'
                        id='idpay'
                        label='IdPay or Credit Card'
                        type='radio'
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className='py-4'
                        checked
                    ></Form.Check>
                </Form.Group>

                <Button
                    type='submit'
                    className='col-4'
                >Continue</Button>
            </Form>
        </FormContainer>
    )
}

export default PaymentScreen