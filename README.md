# 🚀 Project Name – Expense Tracker

Expense Tracker where users can sign up, log in, add, and remove expenses. It has Razorpay integrated as a payment method, allowing users to purchase a premium membership. Complete reports, report downloads, and the leaderboard are available as premium features.

## API Reference

| Methods | Endpoints                             | Description                                          |
| :------ | :------------------------------------ | :--------------------------------------------------- |
| `POST`  | `/user/login`                         | Generates JWT token for existed user                 |
| `POST`  | `/user/signup`                        | Generates JWT token for new user                     |
| `POST`  | `/user/forgot-password`               | Send reset link to user mail                         |
| `GET`   | `/user/resetpassword/:uuid`           | Send a form upon clicking on reset link              |
| `POST`  | `/user/resetpassword`                 | Reset new password                                   |
| `POST`  | `/expense/add_expense`                | Add expense or income                                |
| `GET`   | `/expense/delete_expense/:expense_id` | Delete an expense                                    |
| `GET`   | `/expense/get_expenses`               | Get Expenses according to page size                  |
| `GET`   | `/expense/get_all_expenses`           | Get all expenses                                     |
| `GET`   | `/purchase/buymembership`             | Generates orderId and RazorpayId                     |
| `POST`  | `/purchase/verifyPayment`             | verify payment                                       |
| `GET`   | `/files/download/report`              | Generates presigned url for download report from aws |
| `GET`   | `/expense_features/leaderboard`       | Give users with total expenses in desc order         |
