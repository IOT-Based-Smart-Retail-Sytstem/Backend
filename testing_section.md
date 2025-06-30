# 3.3. Comprehensive Testing Documentation

Comprehensive testing was conducted to ensure system reliability, performance, and correctness across all components including API communication, real-time socket interactions, Firebase integration, database operations, and end-user functionality.

## 3.3.1. API Testing

Postman was used to manually test all backend REST API endpoints across the complete system architecture.

### Tested API Endpoints:

#### Authentication & User Management:
- **POST /auth/login** - User authentication
- **POST /auth/logout** - User logout
- **GET /auth/refresh** - Token refresh
- **GET /user/profile** - Get user profile
- **PUT /user/profile** - Update user profile

#### Product Management:
- **GET /product** - Fetch all products
- **GET /product/:id** - Get product by ID
- **GET /product/barcode/:barcode** - Get product by barcode
- **POST /product** - Create new product
- **PUT /product/:id** - Update product
- **DELETE /product/:id** - Delete product

#### Cart Management:
- **GET /cart** - Fetch user cart details
- **POST /cart/add** - Add product to cart
- **PUT /cart/update** - Update cart item quantity
- **DELETE /cart/remove/:productId** - Remove item from cart
- **POST /cart/clear** - Clear entire cart

#### Category Management:
- **GET /category** - Fetch all categories
- **POST /category** - Create new category
- **PUT /category/:id** - Update category
- **DELETE /category/:id** - Delete category

#### Wishlist Management:
- **GET /wishlist** - Fetch user wishlist
- **POST /wishlist/add** - Add product to wishlist
- **DELETE /wishlist/remove/:productId** - Remove from wishlist

#### Contact & Support:
- **POST /contact** - Submit contact form
- **GET /contact** - Get contact submissions (admin)

#### Payment Processing:
- **POST /payment/create-intent** - Create payment intent
- **POST /payment/confirm** - Confirm payment
- **GET /payment/history** - Get payment history

### API Testing Verification Criteria:
- **HTTP Status Codes**: Verified correct responses (200, 201, 400, 401, 403, 404, 500)
- **Response Structure**: Validated JSON schema compliance
- **Input Validation**: Tested boundary conditions and invalid inputs
- **Error Handling**: Confirmed proper error messages and status codes
- **Authentication**: Verified JWT token validation and role-based access
- **Database Operations**: Ensured CRUD operations work correctly
- **Middleware Functionality**: Tested deserialization, validation, and error handling

## 3.3.2. Socket Event Testing

Custom JavaScript CLI scripts were developed to simulate real-time user interactions and test socket communication across multiple namespaces.

### Cart Socket Testing (`/cart` namespace):

#### Tested Events:
- **set-cart-data** - Initialize session with cart QR code
- **scan-cart-qr** - Start listening for scanned products
- **products-update** - Receive real-time cart updates
- **product-states-update** - Receive product state count updates
- **stop-cart-scanning** - End scanning session
- **clear-cart** - Clear cart and stop scanning
- **cart-connected** - Confirm successful cart connection
- **scanning-stopped** - Confirm scanning stopped
- **cart-cleared** - Confirm cart cleared

#### Testing Objectives:
- **User Session Isolation**: Confirm each user has independent socket sessions
- **Event Isolation**: Ensure events are properly scoped to user-specific rooms
- **Real-time Updates**: Validate immediate propagation of cart changes
- **Listener Management**: Test proper cleanup of Firebase listeners
- **Error Handling**: Verify socket error responses and recovery
- **Authentication**: Test JWT token validation for socket connections
- **Concurrent Users**: Handle multiple simultaneous scanning sessions

### Shelf Socket Testing (`/shelf` namespace):

#### Tested Events:
- **shelf-state-update** - Receive shelf state changes
- **product-states-update** - Receive updated product state counts
- **shelfDataUpdated** - Firebase shelf data updates

#### Testing Objectives:
- **Shelf Monitoring**: Verify real-time shelf state tracking
- **Product State Updates**: Confirm automatic product state changes
- **Weight Monitoring**: Test weight sensor data integration
- **State Count Aggregation**: Validate product state counting
- **Firebase Integration**: Test shelf Firebase listener functionality

## 3.3.3. Firebase Integration Testing

### Cart Firebase Service Testing:
- **Real-time Database Connection**: Test connection to Firebase Realtime Database
- **Product Scanning Events**: Verify barcode scanning triggers
- **Duplicate Prevention**: Test event deduplication logic
- **Listener Management**: Validate proper listener cleanup
- **Data Synchronization**: Ensure cart updates reflect in database
- **Error Recovery**: Test connection failures and recovery

### Shelf Firebase Service Testing:
- **Shelf State Monitoring**: Test shelf sensor data reception
- **Event Emission**: Verify EventEmitter functionality
- **Database Configuration**: Test multiple Firebase app instances
- **State Propagation**: Validate shelf state updates to socket clients

## 3.3.4. Database & Model Testing

### MongoDB Integration:
- **Connection Management**: Test database connection and reconnection
- **Model Validation**: Verify Mongoose schema validation
- **CRUD Operations**: Test all database operations
- **Relationship Management**: Test user-cart-product relationships
- **Transaction Handling**: Verify data consistency

### Tested Models:
- **User Model**: Authentication, profile management
- **Product Model**: Product information, barcode mapping
- **Cart Model**: Shopping cart functionality, item management
- **Category Model**: Product categorization
- **Order Model**: Order processing and history
- **Wishlist Model**: User wishlist management
- **Contact Model**: Support ticket management
- **Session Model**: User session tracking

## 3.3.5. Middleware Testing

### Authentication Middleware:
- **JWT Validation**: Test token verification and expiration
- **User Deserialization**: Verify user context attachment
- **Role-based Access**: Test admin/user permission levels

### Validation Middleware:
- **Request Validation**: Test input schema validation
- **Error Handling**: Verify custom error responses
- **Resource Validation**: Test resource existence checks

## 3.3.6. Functional Testing

### End-to-End User Scenarios:

#### Complete Shopping Flow:
1. **User Registration/Login** - Account creation and authentication
2. **Cart Initialization** - QR code scanning and cart setup
3. **Product Scanning** - Real-time barcode scanning and cart updates
4. **Cart Management** - Add, remove, update quantities
5. **Checkout Process** - Payment integration and order creation
6. **Order Confirmation** - Order status and confirmation

#### Multi-User Scenarios:
- **Concurrent Shopping**: Multiple users with separate carts
- **Cart Switching**: Users switching between different carts
- **Session Management**: Proper session isolation and cleanup

#### Error Scenarios:
- **Network Failures**: Connection loss and recovery
- **Invalid Products**: Scanning non-existent barcodes
- **Authentication Failures**: Expired tokens and re-authentication
- **Database Errors**: Connection issues and data corruption

## 3.3.7. Performance Testing

### Load Testing:
- **Concurrent Socket Connections**: Test multiple simultaneous users
- **API Response Times**: Measure endpoint performance
- **Database Query Performance**: Optimize database operations
- **Memory Usage**: Monitor resource consumption

### Stress Testing:
- **High-frequency Scanning**: Rapid product scanning
- **Large Cart Operations**: Managing carts with many items
- **Extended Sessions**: Long-running socket connections

## 3.3.8. Security Testing

### Authentication & Authorization:
- **JWT Token Security**: Test token validation and expiration
- **Role-based Access Control**: Verify permission enforcement
- **Session Management**: Test session security and cleanup

### Input Validation:
- **SQL Injection Prevention**: Test database query security
- **XSS Prevention**: Validate input sanitization
- **CSRF Protection**: Test cross-site request forgery prevention

## 3.3.9. Bug Resolution

### Critical Bug Fixed:
**Issue**: Multiple Firebase listeners were being registered during repeated scans, leading to duplicate product entries in the cart.

**Root Cause**: The Firebase listener cleanup mechanism was not properly implemented, causing listeners to accumulate with each new scanning session.

**Solution**: Implemented proper listener cleanup by:
1. Storing the current listener reference in `currentListener` property
2. Adding `cleanupListener()` method to properly unsubscribe from Firebase events
3. Calling cleanup before attaching new listeners in `startCartScanning()`
4. Using Firebase's `off()` method to properly remove listeners

**Impact**: Eliminated duplicate product entries and improved system reliability.

### Additional Improvements:
- **Error Handling**: Enhanced error recovery mechanisms
- **Logging**: Improved debugging and monitoring capabilities
- **Performance**: Optimized database queries and socket event handling
- **User Experience**: Better real-time feedback and error messages

## 3.3.10. Testing Tools & Environment

### Testing Tools Used:
- **Postman**: API endpoint testing and documentation
- **Custom CLI Scripts**: Socket event simulation
- **MongoDB Compass**: Database inspection and validation
- **Firebase Console**: Real-time database monitoring
- **Socket.IO Client**: Socket connection testing

### Testing Environment:
- **Development Server**: Local testing environment
- **Firebase Test Database**: Isolated testing database
- **Mock Data**: Comprehensive test datasets
- **Automated Scripts**: Repeatable test scenarios

This comprehensive testing approach ensures the system's reliability, performance, and security across all components and use cases. 