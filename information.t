
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
                        3 = nothing

=> type -> 0 = sales
            1 = purchase
            2 = others
            3= booking

=> subtype ->
                1 = sales/purchase invoice    
                2 = sales/purchase return  
                3 = sales/purchase paymentin  
                4 = sales/purchase paymentout  
                5 = counter sale
                6 = other

=> paymentType ->   0 = cash , 1 = online, 2 = wallet

=> billingType -> 0 = unpaid, 1 = paid, 2 = nothing

=> transectionType -> 1 = invoice  
                        2 = return
                        3 = paymentin
                        4 = paymentout
                        5 = countersale

** table -> (invoice) 
=> type  ->  0= booking
                        1= sale
                        2= counter sale
                        3 = sale return 
                        4 = purchase 
                        5 = purchase return 

** table -> (sale invoice) 
=> type  ->             0= sale
                        1 = sale return 
                        2 = counter sale

** table -> (purchase invoice) 
=> type  ->             0= purchase
                        1= purchase return 

** table -> (banner) 

=> type -> 0 = user
            1 = vendor
            2 = both