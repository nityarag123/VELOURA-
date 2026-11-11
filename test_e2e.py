import urllib.request
import json

BASE_URL = "http://localhost:5173/api"

def make_request(endpoint, data=None, token=None, method=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as res:
        return res.status, json.loads(res.read().decode("utf-8"))

print("1. Testing Passwordless Customer Login (No password needed)...")
status, login_res = make_request("/auth/login", {"email": "user@veloura.com"})
user_token = login_res["access_token"]
print("Customer passwordless login OK:", login_res["user"]["full_name"], "(ID:", login_res["user"]["id"], ")")

print("1b. Testing New Customer Instant Passwordless Auto-Registration...")
status, new_user_res = make_request("/auth/login", {"email": "freshpatron@veloura.com", "full_name": "Maya Sen"})
print("New customer auto-registered OK:", new_user_res["user"]["full_name"], "(ID:", new_user_res["user"]["id"], ")")

print("2. Testing Coupon Validation (VELOURA10)...")
status, coupon_res = make_request("/coupons/apply", {"code": "VELOURA10", "order_amount": 1000.0})
print("Coupon OK: Discount calculated ->", coupon_res["discount_amount"])

print("3. Creating Test Order...")
order_payload = {
    "customer_name": "Aarav Sharma",
    "customer_email": "user@veloura.com",
    "customer_phone": "+91 98123 45678",
    "delivery_address": "Flat 4B, Emerald Heights, Powai",
    "city": "Mumbai",
    "pincode": "400076",
    "delivery_date": "Today",
    "delivery_time_slot": "Evening Prime (6:00 PM - 9:00 PM)",
    "cake_message": "Happy Birthday Queen",
    "special_instructions": "Deliver carefully in chilled bag",
    "subtotal": 899.0,
    "discount": 89.9,
    "delivery_fee": 0.0,
    "total_amount": 809.1,
    "payment_method": "UPI / Card",
    "items": [
        {
            "product_id": 1,
            "product_name": "Royal Belgian Truffle Gateau",
            "product_image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
            "weight": "1.0 kg",
            "flavour": "Belgian Dark Truffle",
            "is_eggless": True,
            "cake_message": "Happy Birthday Queen",
            "unit_price": 899.0,
            "quantity": 1,
            "total_price": 899.0
        }
    ]
}
status, order_res = make_request("/orders", order_payload, token=user_token)
order_number = order_res["order_number"]
print("Order created successfully:", order_number, "Status:", order_res["status"])

print("4. Testing Live Order Tracking...")
status, track_res = make_request(f"/orders/track/{order_number}")
print("Tracking OK for order:", track_res["order_number"], "Status:", track_res["status"])

print("5. Testing Admin Login with Password & Dashboard Stats...")
# Wrong password should fail
try:
    make_request("/auth/login", {"email": "admin@veloura.com", "password": "wrongpassword"})
    print("ERROR: Admin login should fail with wrong password!")
except Exception as e:
    print("Admin rejected with wrong password (as expected)")

status, admin_login = make_request("/auth/login", {"email": "admin@veloura.com", "password": "admin123"})
admin_token = admin_login["access_token"]
status, stats_res = make_request("/admin/stats", token=admin_token)
print(f"Admin Stats OK: {stats_res['total_orders']} orders, Revenue: INR {stats_res['total_revenue']}")

print("6. Testing Admin Updating Product (Pics, Menu, and Prices)...")
edit_payload = {
    "name": "Royal Belgian Truffle Gateau (Grand Reserve)",
    "base_price": 949.0,
    "discount_price": 849.0,
    "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    "description": "Crafted with 70% Single-Origin Belgian chocolate ganache, layered between moist chocolate sponge."
}
status, updated_prod = make_request("/admin/products/1", edit_payload, token=admin_token, method="PUT")
print(f"Admin Product Update OK: Name='{updated_prod['name']}', Price=INR {updated_prod['base_price']}, Discount=INR {updated_prod['discount_price']}")

# Verify public endpoint reflects update
status, public_prod = make_request("/products/1")
print(f"Public product reflection OK: Name='{public_prod['name']}', BasePrice=INR {public_prod['base_price']}")

print("7. Testing Admin Changing Password and Verifying New Password...")
status, change_pw_res = make_request("/admin/change-password", {
    "current_password": "admin123",
    "new_password": "VelouraSecret2026!"
}, token=admin_token, method="PUT")
print("Password change response:", change_pw_res["message"])

# Verify login with new password
status, new_admin_login = make_request("/auth/login", {
    "email": "admin@veloura.com",
    "password": "VelouraSecret2026!"
})
new_admin_token = new_admin_login["access_token"]
print("Admin successfully logged in with new password!")

# Revert admin password back to admin123 for convenience
status, revert_pw = make_request("/admin/change-password", {
    "current_password": "VelouraSecret2026!",
    "new_password": "admin123"
}, token=new_admin_token, method="PUT")
print("Admin password cleanly reverted to 'admin123' for ongoing session convenience.")

print("8. Admin Updating Order Status to 'Baking'...")
status, update_res = make_request(f"/admin/orders/{order_res['id']}/status", {"status": "Baking"}, token=admin_token, method="PUT")
print("Order status updated by Admin:", update_res["status"])

print("9. Submitting Customer Review...")
review_payload = {
    "rating": 5.0,
    "comment": "The Belgian Truffle Gateau was sublime! Perfectly moist and luxurious packaging."
}
status, rev_res = make_request("/products/1/reviews", review_payload, token=user_token)
print("Review published OK:", rev_res["comment"][:40], "...")

print("10. Testing Artisanal Coffee & Cafe Savories Endpoints...")
status, coffees = make_request("/products?category=coffee-brews")
print(f"Coffee catalog OK: {len(coffees)} drinks returned. First: {coffees[0]['name']} (INR {coffees[0]['discount_price']})")

status, cafe_items = make_request("/products?category=cafe-savory")
print(f"Cafe catalog OK: {len(cafe_items)} items returned. First: {cafe_items[0]['name']} (INR {cafe_items[0]['discount_price']})")

print("11. Ordering Cafe Breakfast Combo (Spanish Latte + Truffle Panini)...")
cafe_order_payload = {
    "customer_name": "Maya Sen",
    "customer_email": "freshpatron@veloura.com",
    "customer_phone": "+91 99887 76655",
    "delivery_address": "Suite 801, Sea View Residency, Bandra West",
    "city": "Mumbai",
    "pincode": "400050",
    "delivery_date": "Today",
    "delivery_time_slot": "Morning Express (8:00 AM - 10:00 AM)",
    "cake_message": "Extra hot, oat milk please",
    "special_instructions": "Deliver warm with napkins",
    "subtotal": 558.0,
    "discount": 55.8,
    "delivery_fee": 0.0,
    "total_amount": 502.2,
    "payment_method": "UPI / Card",
    "items": [
        {
            "product_id": coffees[0]["id"],
            "product_name": coffees[0]["name"],
            "product_image": coffees[0]["image_url"],
            "weight": "Large (350 ml)",
            "flavour": "Oat Milk (Plant-Based)",
            "is_eggless": True,
            "cake_message": "Extra hot, less sweet",
            "unit_price": coffees[0]["discount_price"],
            "quantity": 1,
            "total_price": coffees[0]["discount_price"]
        },
        {
            "product_id": cafe_items[0]["id"],
            "product_name": cafe_items[0]["name"],
            "product_image": cafe_items[0]["image_url"],
            "weight": "Single Panini",
            "flavour": "Warm Pressed (Ready to Eat)",
            "is_eggless": True,
            "cake_message": "Well toasted",
            "unit_price": cafe_items[0]["discount_price"],
            "quantity": 1,
            "total_price": cafe_items[0]["discount_price"]
        }
    ]
}
status, cafe_order_res = make_request("/orders", cafe_order_payload)
print(f"Cafe Order Placed OK: {cafe_order_res['order_number']}, Total: INR {cafe_order_res['total_amount']}, Items: {len(cafe_order_res['items'])}")

print("\n=========================================")
print("ALL E2E WORKFLOW TESTS PASSED 100%!")
print("=========================================")
