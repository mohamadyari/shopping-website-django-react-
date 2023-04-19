import React, { useState, useEffect } from 'react'
import FormContainer from '../components/FormContainer'
import { Form, Button, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { userLoginAction } from '../actions/userActions'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'

function LoginScreen({ location, history }) {

    var redirect = location.search ? location.search.split('=')[1] : '/'
    if (redirect === 'success' || redirect === 'fail') {
        redirect = '/'
    }
    const tokenResult = location.search ? location.search.split('=')[1] : ""

    const dispatch = useDispatch()
    const userLogin = useSelector(state => state.userLogin)
    const { error, userInfo, loading } = userLogin

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [activationMessage, setActivationMessage] = useState('')

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(userLoginAction(email, password))
    }

    useEffect(() => {
        if (userInfo) {
            history.push(redirect)
        } else if (!userInfo) {
            switch (tokenResult) {

                case 'success':
                    setActivationMessage('Your account successfully activated. Now you can login')
                    break;

                case 'fail':
                    setActivationMessage('Your activation link isn\'t valid. Please go to register page and try again.')
                    break;

                default:
                    setActivationMessage('')
            }
        }

    }, [history, userInfo, redirect, tokenResult])


    return (
        <FormContainer>

            <h1>sign in</h1>

            {
                loading ? <Loader />
                    : error ? <Message variant='danger' text={error} />
                        : tokenResult === 'success' ? <Message variant='success' text={activationMessage} />
                            : tokenResult === 'fail' ? <Message variant='danger' text={activationMessage} />
                                : <></>
            }
            <Form onSubmit={submitHandler}>
                <Form.Group controlId='email'>
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type='email'
                        placeholder='Enter Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Form.Group controlId='password' className='my-4'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder='Enter Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Button
                    type='submit'
                    variant='primary'
                    className='col-4'
                >
                    sign in
                </Button>

            </Form>


            <Row className="my-4">
                <Col>
                    New Customer ?

                    <Link to={redirect ? `/register?redirect=${redirect}` : `/register`}>
                        Register
                    </Link>
                </Col>
            </Row>
        </FormContainer >
    )
}

export default LoginScreen