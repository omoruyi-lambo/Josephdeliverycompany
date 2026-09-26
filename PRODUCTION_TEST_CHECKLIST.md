# Josephdeliverycompany Production Test Checklist

Use the existing administrator account created for this project. Do not add credentials to this file. If access is unavailable, use the Supabase authentication system to create or authorize an administrator.

## Public website

- [ ] Homepage loads
- [ ] Header navigation works
- [ ] Mobile navigation works
- [ ] Hero image loads
- [ ] Track Shipment button works
- [ ] Get a Quote button works
- [ ] Services page works
- [ ] Locations page works
- [ ] Contact page works
- [ ] Sign In works
- [ ] Sign Up works
- [ ] Footer links work

## Tracking

- [ ] Enter a valid tracking number
- [ ] Shipment loads from Supabase
- [ ] Invalid tracking number handled correctly
- [ ] Tracking history displays
- [ ] Current location displays
- [ ] Origin displays
- [ ] Destination displays
- [ ] Map displays when coordinates exist
- [ ] Missing coordinates do not crash the page

## Admin

- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Shipment creation works
- [ ] Shipment editing works
- [ ] Tracking event creation works
- [ ] Shipment status update works
- [ ] Shipment location update works
- [ ] Public tracking reflects admin changes

## Quotes

- [ ] Submit quote request
- [ ] Confirm request appears in Supabase
- [ ] Confirm request appears in admin
- [ ] Change quote status
- [ ] Refresh and confirm status persists

## Contact

- [ ] Submit contact message
- [ ] Confirm message appears in Supabase
- [ ] Confirm message appears in admin
- [ ] Change message status
- [ ] Add admin reply
- [ ] Refresh and confirm reply persists

## Locations

- [ ] Locations load
- [ ] Search works
- [ ] Filtering works
- [ ] Location images load
- [ ] Admin can edit location
- [ ] Admin can activate/deactivate location

## Responsive

- [ ] Desktop (1920px)
- [ ] Laptop (1440px)
- [ ] Tablet (1024px / 768px)
- [ ] 480px mobile
- [ ] 375px mobile

## Security

- [ ] Logged-out user cannot access admin
- [ ] Normal user cannot access admin
- [ ] Public user cannot read private messages
- [ ] Public user cannot modify shipments
- [ ] Public user cannot modify locations
- [ ] API secrets are not exposed
