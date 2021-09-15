# presentation_app
Creating a socket.io based presentation demo app with live presentation controlled from one page showcasing the live feed on the other. This uses socket.io rooms feature to publish message from one user to another.

# Step to run this application - 
    - Make sure 3001 port is open.
    - Run npm install 
    - Run npm start
    - Open 'http://localhost:3001/' in browser.

## Note: It expects Session_id already being set in Redis in format of key value as - 
    SET 123 '{"session_id":123,"controller_token":1234,"presentation_token":1234,"channel_id":123456}'
