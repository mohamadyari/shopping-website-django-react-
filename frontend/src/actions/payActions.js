export const inquiryPayResult = (authRequestAxios, order_id, payInq) => {

    const response = authRequestAxios.post(
        `/api/v1/orders/${order_id}/inquirypay/`,
        payInq
    )
    return response
}