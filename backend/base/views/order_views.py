from rest_framework import status
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base.models import Product,Order,OrderItem,ShippingAddress, Idpay
from base.serializers import OrderSerializer
from base.utils.pay_utils import idpayCreateDB, idpayUpdateDB, idpayCompleteDB, idpayInquiry, idpayCreatePay, makeInquiryPayResult


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addOrderItems(request):
    user = request.user
    data = request.data
    
    orderItems = data['orderItems']
    
    if not orderItems:
        return Response({'detail':'No Order Items'}, status=status.HTTP_400_BAD_REQUEST)
    
    else:
        # (1) Create order
        
        order = Order.objects.create(
            user = user,
            paymentMethod = data['paymentMethod'],
            taxPrice = data['taxPrice'],
            shippingPrice = data['shippingPrice'],
            totalPrice = data['totalPrice'],
        )
        
        # (2) Create shipping address
        
        shipping = ShippingAddress.objects.create(
            order = order,
            address = data['shippingAddress']['address'],
            city = data['shippingAddress']['city'],
            country = data['shippingAddress']['country'],
            postalCode = data['shippingAddress']['postalCode'],
        )
        
        # (3) Create order item and set order to orderItems relationship
        
        for i in orderItems:
            product = Product.objects.get(_id=i['product'])

            item = OrderItem.objects.create(
                product=product,
                order = order,
                name = product.name,
                qty=i['qty'],
                price = i['price'],
                image=product.image.url
            )
            
            # (4) Update stock
            product.countInStock -= item.qty
            product.save()
        serializer = OrderSerializer(order,many=False)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = user.order_set.all()
    serializer = OrderSerializer(orders,many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request,pk):
    try:
        user = request.user
        order = Order.objects.get(_id=pk)
        
        if user.is_staff or order.user == user :
            serializer = OrderSerializer(order,many=False)
            return Response(serializer.data)
        else:
            return Response({'detail':'Not authorized to view this order !'},
                            status=status.HTTP_400_BAD_REQUEST)  
    except:
        return Response({'detail':'Order does not exist !'},
                        status=status.HTTP_404_NOT_FOUND)     
        
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payOrder(request,pk):
    user = request.user
    
    try:
        order = Order.objects.get(_id=pk)
    except Order.DoesNotExist:
        return Response({'detail':'Order not found !'}, status=status.HTTP_404_NOT_FOUND)
    else:
        
        if order.isPaid:
            return Response({'detail':'Order has already been paid !'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                response = idpayCreatePay(user,order)
            except:
                return Response({'detail':'The idpay server connection was not established !'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                
                if(str(response.status_code).startswith('2')):
                    resJson = response.json()
                    if(idpayCreateDB(user, order, resJson['id'])):
                        return Response(resJson, status=status.HTTP_200_OK)
                    else:
                        return Response({'detail':'db error !'},
                                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
      
@api_view(['POST'])
@permission_classes([IsAuthenticated])                  
def inquiryPay(request, pk):
    try:
        data = request.data
        user = request.user
        transId = data['transId']
        track_id = data['track_id']
        order = Order.objects.get(_id=pk)
        pay_entry = Idpay.objects.get(transId=transId, user=user)
    except:
        return Response({'detail':'Transaction details not found!'}, status=status.HTTP_404_NOT_FOUND)
    else:
        if(pay_entry.trackIdpay and pay_entry.lastStatus != 0):
            if(str(pay_entry.trackIdpay) == str(track_id) and pay_entry.order == order):
                return Response(makeInquiryPayResult(pay_entry.lastStatus, order._id, track_id), status=status.HTTP_200_OK)
            else:
                return Response({'detail':'Transaction details are not valid!'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Transaction inquiry
            try:
                response = idpayInquiry(transId, order._id)
            except:
                if(idpayUpdateDB(pay_entry, 500, track_id)):
                    return Response(makeInquiryPayResult(500, order._id, track_id), status=status.HTTP_200_OK)
                else:
                    return Response({'detail':'REGISTRATION_ERROR!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                if(str(response.status_code).startswith('2')):
                    try:
                        resJson = response.json()
                        lastStatus = resJson['status']
                    except:
                        if(idpayUpdateDB(pay_entry, 500, track_id)):
                            return Response(makeInquiryPayResult(500, order._id, track_id), status=status.HTTP_200_OK)
                        else:
                            return Response({'detail':'REGISTRATION_ERROR!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    else:
                        if(lastStatus == 100 or lastStatus == 101 or lastStatus == 200):
                            if(idpayCompleteDB(resJson)):
                                return Response(makeInquiryPayResult(lastStatus, order._id, track_id), status=status.HTTP_200_OK)
                            else:
                                return Response({'detail':'REGISTRATION_PAYMENT_CONFIRMED_ERROR!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        else:
                            if(idpayUpdateDB(pay_entry, lastStatus, track_id)):
                                return Response(makeInquiryPayResult(lastStatus, order._id, track_id), status=status.HTTP_200_OK)
                            else:
                                return Response({'detail':'PAYMENT_IS_NOT_COMPLETE!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    if(idpayUpdateDB(pay_entry, 500, track_id)):
                        return Response(makeInquiryPayResult(500, order._id, track_id), status=status.HTTP_200_OK)
                    else:
                        return Response({'detail':'REGISTRATION_ERROR!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            