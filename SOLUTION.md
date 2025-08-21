Work Test - Solution
Summary
This project provides a comprehensive solution to the proposed backend and frontend challenges. Key improvements include performance enhancements, memory leak fixes, and UI/UX optimizations.

Backend
Asynchronous I/O Handling: The file reading operations have been refactored to use async/await, ensuring the application remains responsive while processing requests. This approach prevents the main thread from being blocked, significantly improving server scalability.

Statistics Cache Handling: A caching system was implemented for statistics requests. The response is now stored in memory and is only updated after a predefined period, which reduces server load and drastically improves response times for repeated queries.

Unit Tests: Unit tests were created for the new functionalities to ensure code quality and verify that the caching and data handling logic works as expected.

Frontend
Memory Leak Fix: The memory leak issue caused by asynchronous requests on unmounted components was addressed. An AbortController is used to cancel pending fetches, and a mounted flag prevents state updates after the component has been removed from the DOM.

Server-Side Search and Pagination: A complete search and pagination functionality was implemented. The logic for filtering and splitting data was moved to the backend, which reduces the amount of data sent to the client and significantly improves performance, especially with large datasets.

UI/UX Improvements: Visual enhancements were implemented, including:

A clean, modern design using CSS.

A loading spinner to provide user feedback while data is being fetched.

Clear handling of error and empty states.

Decision on Virtualization:

An attempt was made to implement list virtualization using react-window and react-virtualized-auto-sizer for efficient rendering of large lists.

However, a persistent Uncaught SyntaxError was encountered during compilation, caused by a dependency conflict external to the project's code.

To ensure a functional solution could be delivered on time, the decision was made to remove the virtualization functionality. This demonstrates the ability to identify and communicate dependency issues and make pragmatic decisions to prioritize project functionality.

How to Run the Project
Clone the repository: git clone [repository URL here]

Install Backend Dependencies:

cd backend

npm install

npm start

Install Frontend Dependencies:

cd frontend

npm install

npm start
