import { Route, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PrivateRoute = ({ children, ...rest }) => {

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    return (
        <Route {...rest}>{!userInfo ? <Redirect to={`/login?redirect=${rest['path']}`} /> : children}</Route>
    )
}

export default PrivateRoute