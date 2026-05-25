import { parseSignedEnveloppe } from "../../../../../../src/middlewares/parseSignedEnveloppe.js";
import { saveFederationEvent } from "../../../../../../src/middlewares/saveFederationEvent.js";
import route from "../../../../../../src/routes/federation/v1/transfers/init.js";
import { mockFastify } from "../../../../../mock.js";

vi.mock(import("../../../../../../src/middlewares/parseSignedEnveloppe.js"));
vi.mock(import("../../../../../../src/middlewares/saveFederationEvent.js"));

describe("Federation Transfer Init Route", () => {
  beforeEach(() => {
    vi.mocked(saveFederationEvent).mockReturnValue("saveFederationEventMock" as never);
    vi.mocked(parseSignedEnveloppe).mockReturnValue("parseSignedEnveloppeMock" as never);
  });

  it("should have the correct schema", () => {
    const fastify = mockFastify();
    route(fastify);
    expect(fastify.route).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/federation/v1/transfers/init",
        preHandler: [parseSignedEnveloppe, saveFederationEvent("FEDERATION_TRANSFER_INIT")],
        handler: expect.any(Function),
      }),
    );
  });
});
