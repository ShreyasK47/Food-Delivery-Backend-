# Food-Delivery-Backend-with-Order-Management
 Overview
 The Food Delivery Backend provides APIs for managing restaurant menus, handling orders, and
 simulating order status updates, helping build the foundation for a food delivery service.
 Features
 1. Addmenuitems with details like name, price, and category.
 2. Place orders by selecting multiple items from the menu.
 3. Track the status of an order, which automatically updates over time.
 Requirements
 ● Endpoints:
 ○ AddMenuItem(POST /menu):Create or update menu items.
 ○ GetMenu(GET /menu):Retrieve menu items.
 ○ PlaceOrder (POST /orders): Create an order with selected menu items.
 ○ GetOrder(GET /orders/:id): Fetch details of a specific order.
 ○ UpdateStatus (CRON job): Automate status updates from Preparing → Out
 for Delivery→Delivered.
 ● DataValidation:
 ○ Validate menu item fields like price (positive) and category (predefined).
 ○ Validate order requests to ensure item IDs exist.
 Solution Design
 ● Useaqueuefor managing order statuses and processing.
 ● Store menu items and orders in separate in-memory arrays or collections.
 ● Integrate node-cron to simulate periodic status updates

# Run the code
->npm i express body-parser node-cron ws
->npm start
