
** table -> (vendor,shopService) 
=> serviceType  ->  1= two wheeler
                        2= three wheeler
                        3= four wheeler
                        4= havy vehical
                        

** table -> (service and rate)                
=> emergencyTiming  -> 0 = available 24*7
                        1 = shop timings

** table -> (address)                
=> emergencyTiming  -> 1 = home
                        2 = work
                        3 = others

** table -> (myVehicle) 
=> vehicleType  ->  1= two wheeler
                        2= three wheeler
                        3= four wheeler
                        4= havy vehical

=> fuelType ->  1 = petrol 
                2 = diesel
                3 = cng
                4 = electric

** table -> (booking) 
=> serviceType  ->  1= self
                        2= pickup
                        3= drop
                        4= both

=> status  ->  0= request sent
                        1= accepted
                        2= vehical collect by vendor
                        3= pending
                        4= work in progress
                        5= cancelled
                        6= completed
                        7= vehical recived by user
                        8= declined
                        9= cancelled (user)

=> paymentMode -> 0 = upi
                    1 = bank/card
                    2 = cash
                    3 = other

** table -> (booking) 
=> SubMechanic  ->  0= salary
                        1= commission

** table -> (product log) 
=> type  ->  0= in
                 1= out

** table -> (transection) 
=> amountType  ->  0= debit
                        1= credit

