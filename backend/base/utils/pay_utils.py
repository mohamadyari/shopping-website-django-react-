import requests, json

from base.utils.X_API_KEY import X_API_KEY
from base.utils.IDPAY_STATUS import IDPAY_STATUS
from base.models import Idpay, Order

from datetime import datetime, timezone
from django.utils.timezone import make_aware


IDPAY_HEADER = {
    'Content-Type':'application/json',
    'X-API-KEY':X_API_KEY,
    'X-SANDBOX':'1'
}

 
def idpayCreatePay(user, order):
    # ایجاد یک تراکنش جدید در سرور آیدی پی
    
    body = {
        'order_id' : str(order._id),
        'amount': int(order.totalPrice * 10),
        'mail' : user.email,
        'callback' : 'http://127.0.0.1:8000/api/v1/air/result/'
    }
    
    response = requests.post(
        'https://api.idpay.ir/v1.1/payment',
        data=json.dumps(body),
        headers = IDPAY_HEADER,
    )
    
    return response


def idpayVerify(transId, order_id):
    # ارسال درخواست تایید تراکنش برای جلوگیری از بازگشت پول
    
    body = {
        'id': str(transId),
        'order_id': str(order_id),
    }
    
    response = requests.post(
        'https://api.idpay.ir/v1.1/payment/verify',
        data=json.dumps(body),
        headers=IDPAY_HEADER
    )

    return response


def idpayInquiry(transId, order_id):
    body = {
        'id': str(transId),
        'order_id': str(order_id)
    }
    
    response = requests.post(
        'https://api.idpay.ir/v1.1/payment/inquiry',
        data=json.dumps(body),
        headers=IDPAY_HEADER
    )
    
    return response


def idpayCreateDB(user, order, id):
    try:
        # ایجاد یک موجودیت جدید در جدول تراکنش ها با ثبت آی دی آن
        
        idpay = Idpay.objects.create(
            user = user,
            order = order,
            transId = id,
            lastStatus = 0 ,
            amountCreate = (order.totalPrice * 10)
        )
        return True
    except:
        return False
    

def idpayUpdateDB(pay_entry, lastStatus, trackIdpay):
    try:
        # ثبت اخرین وضعیت تراکنش
       
        pay_entry.lastStatus = lastStatus
        pay_entry.trackIdpay = trackIdpay
        pay_entry.save()
        return True
    except:
        return False
  
  
def idpayCompleteDB(data):
    try:
        # ثبت اطلاعات کامل تراکنش در دیتابیس
        
        pay = Idpay.objects.get(transId=data['id'])
        pay.lastStatus = data['status']
        pay.trackIdpay = data['track_id']
        pay.trackShaparak = data['payment']['track_id']
        pay.amountPaid = data['payment']['amount']
        pay.cardNo = data['payment']['card_no']
        
        # اگاه سازیه سیستم از تایم زون 
        pay.dateShaparak = make_aware(datetime.fromtimestamp(int(data['payment']['date'])), timezone.utc)
        pay.dateVerify = make_aware(datetime.fromtimestamp(int(data['verify']['date'])), timezone.utc)
        pay.save()
        
        # تغییر وضعیت سفارش به پرداخت شده
        order = Order.objects.get(_id=data['order_id'])
        order.isPaid = True
        
        # اگاه سازیه سیستم از تایم زون
        order.paidAt = make_aware(datetime.fromtimestamp(int(data['payment']['date'])), timezone.utc)
        order.save()
        
        return True
    except:
        return False      
    

def makeInquiryPayResult(lastStatus, order_id, track_id):
    msg = ""
    success = False
    
    if lastStatus == 100 or lastStatus == 101 or lastStatus == 200:
        success = True
        
    for k,v in IDPAY_STATUS.items():
        if k == lastStatus:
            msg = v
            
    if msg == "":
        msg = "Transaction status Unknown!"
    
    return {
        'message': msg, 
        'success': success,
        'status': lastStatus,
        'order_id': order_id,
        'track_id': track_id,
    }
            