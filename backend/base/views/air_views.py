from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes

from base.models import Idpay, Order
from base.utils.pay_utils import idpayUpdateDB, idpayVerify, idpayCompleteDB

from django.http import HttpResponseRedirect
@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def IdPayCallBack(request):
    data = request.data
    
    try:
        callBackPayStatus = data['status']
        trackIdpay = data['track_id']
        transId = data['id']
        order_id = data['order_id']
        
        order = Order.objects.get(_id=order_id)
        pay_entry = Idpay.objects.get(transId=transId, order=order)
        
        if order.isPaid:
            return HttpResponseRedirect(f"http://localhost:3000/payresult/{trackIdpay}/{order_id}/{transId}?db=Null")
    except:
        return Response({'detail':'Transaction processing error !'}, status=status.HTTP_400_BAD_REQUEST)
    
    else:
        # Transaction verify
        if(str(callBackPayStatus) == '10'):
            try:
                response = idpayVerify(transId, order_id)
            except:
                dbStatus = idpayUpdateDB(pay_entry, 500, trackIdpay)
                return HttpResponseRedirect(f"http://localhost:3000/payresult/{trackIdpay}/{order_id}/{transId}?db={dbStatus}")
            else:
                
                if(str(response.status_code).startswith('2')):
                    resJson = response.json()
                    dbStatus = idpayCompleteDB(resJson)
                    return HttpResponseRedirect(f"http://localhost:3000/payresult/{trackIdpay}/{order_id}/{transId}?db={dbStatus}")
                else:
                    dbStatus = idpayUpdateDB(pay_entry, 400, trackIdpay)
                    return HttpResponseRedirect(f"http://localhost:3000/payresult/{trackIdpay}/{order_id}/{transId}?db={dbStatus}")
        else:
            dbStatus = idpayUpdateDB(pay_entry, callBackPayStatus, trackIdpay)
            return HttpResponseRedirect(f"http://localhost:3000/payresult/{trackIdpay}/{order_id}/{transId}?db={dbStatus}")
        