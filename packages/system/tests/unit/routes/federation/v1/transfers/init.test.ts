import { parseSignedMessage } from "../../../../../../src/middlewares/parseSignedMessage.js";
import { saveFederationEvent } from "../../../../../../src/middlewares/saveFederationEvent.js";
import route from "../../../../../../src/routes/federation/v1/transfers/init.js";
import { mockFastify } from "../../../../../mock.js";

vi.mock("../../../../../../src/middlewares/parseSignedMessage.js");
vi.mock("../../../../../../src/middlewares/saveFederationEvent.js");

describe("Federation Transfer Init Route", () => {
  beforeEach(() => {
    vi.mocked(saveFederationEvent).mockReturnValue("saveFederationEventMock" as never);
  });

  it("should have the correct schema", () => {
    const fastify = mockFastify();
    route(fastify);
    expect(fastify.route).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/federation/v1/transfers/init",
        preHandler: [parseSignedMessage, saveFederationEvent("FEDERATION_TRANSFER_INIT")],
        handler: expect.any(Function),
      }),
    );
  });
});
