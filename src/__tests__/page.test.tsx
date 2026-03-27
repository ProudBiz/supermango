import { render } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("Home page", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(document.querySelector("main")).toBeInTheDocument();
  });
});
