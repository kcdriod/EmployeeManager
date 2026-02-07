import { render, screen } from "@testing-library/react";
import App from "./App";
import { api } from "./api";

jest.mock("./api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

test("renders employee command center heading", async () => {
  api.get.mockResolvedValue({ data: [] });
  render(<App />);
  expect(await screen.findByText(/employee command center/i)).toBeInTheDocument();
});
