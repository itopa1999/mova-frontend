<!-- TODO -->
1. make sure that verify-email does nt' show register page before going to pjin
2. make sure that is only one error message pops up when there's any error please.
3. making sure that the flow from registeration, verify or resend/verify, pin setup, dashbaord
4. All Pages should show the message please.
5. remove any emoji and replace it with the installed icon
5. Any new register users deletes all the localstorage

Unexpected Application Error!
Invalid time value
RangeError: Invalid time value
    at format (http://localhost:5173/node_modules/.vite/deps/date-fns-DrRlKu4Q.js?v=30e7cfae:5042:36)
    at Day (http://localhost:5173/src/components/ui/ReleaseCalendar.tsx:211:18)
    at Object.react_stack_bottom_frame (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:12866:12)
    at renderWithHooks (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:4213:19)
    at updateFunctionComponent (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:5569:16)
    at beginWork (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:6140:20)
    at runWithFiberInDEV (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:851:66)
    at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:8429:92)
    at workLoopSync (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:8325:37)
    at renderRootSync (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:8309:6)
💿 Hey developer 👋

You can provide a way better UX than this when your app throws errors by providing your own ErrorBoundary or errorElement prop on your route.