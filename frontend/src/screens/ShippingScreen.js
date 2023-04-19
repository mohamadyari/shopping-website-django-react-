import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import { useDispatch, useSelector } from 'react-redux'
import { saveShippingAddress } from '../actions/cartActions'
import CheckoutSteps from '../components/CheckoutSteps'


function ShippingScreen({ history }) {


    const dispatch = useDispatch()
    const cart = useSelector(state => state.cart)
    const { shippingAddress } = cart

    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode)
    const [address, setAddress] = useState(shippingAddress.address)
    const [city, setCity] = useState(shippingAddress.city)
    const [country, setCountry] = useState(shippingAddress.country)


    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(saveShippingAddress({ postalCode, address, city, country }))
        history.push('/payment')
    }

    return (
        <FormContainer>
            <CheckoutSteps step1 step2 />
            <h1>shipping</h1>

            <Form onSubmit={submitHandler}>
                <Form.Group controlId='postalCode' className='mt-4'>
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter postal code'
                        value={postalCode ? postalCode : ""}
                        onChange={(e) => setPostalCode(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='address' className='mt-4'>
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter address'
                        value={address ? address : ""}
                        onChange={(e) => setAddress(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='city' className='mt-4'>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter city'
                        value={city ? city : ""}
                        onChange={(e) => setCity(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='country' className='mt-4'>
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        required
                        type='text'
                        placeholder='Enter country'
                        value={country ? country : ""}
                        onChange={(e) => setCountry(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Button
                    type='submit'
                    className='col-4 mt-4'>Continue</Button>
            </Form>
        </FormContainer>
    )
}

export default ShippingScreen