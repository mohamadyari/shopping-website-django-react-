import Header from './components/Header'
import Footer from './components/Footer'
import { Container } from 'react-bootstrap'
import HomeScreen from './screens/HomeScreen';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import PayResultScreen from './screens/PayResultScreen';
import PrivateRoute from './utils/PrivateRoute';



function App() {
  return (
    <Router>
      <Header />
      <main>
        <Container className='py-3'>
          <Route path='/' component={HomeScreen} exact />
          <Route path='/login' component={LoginScreen} />
          <Route path='/register' component={RegisterScreen} />
          <PrivateRoute path='/profile' component={ProfileScreen} />
          <Route path='/shipping' component={ShippingScreen} />
          <Route path='/payment' component={PaymentScreen} />
          <Route path='/placeorder' component={PlaceOrderScreen} />
          <Route path='/order/:id' component={OrderScreen} />
          <Route path='/product/:id' component={ProductScreen} />
          <Route path='/cart/:id?' component={CartScreen} />
          <PrivateRoute path='/payresult/:trackId/:oid/:transId' component={PayResultScreen} />
        </Container>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
