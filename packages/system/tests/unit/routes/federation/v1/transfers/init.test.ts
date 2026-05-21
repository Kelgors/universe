import { ZodType } from "zod";
import { checkSignature } from "../../../../../../src/middlewares/checkSignature.js";
import { saveFederationEvent } from "../../../../../../src/middlewares/saveFederationEvent.js";
import route from "../../../../../../src/routes/federation/v1/transfers/init.js";
import { mockFastify } from "../../../../../mock.js";

vi.mock("../../../../../../src/middlewares/checkSignature.js");
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
        schema: expect.objectContaining({
          body: expect.objectContaining({
            shape: {
              message: expect.any(ZodType),
              nodeId: expect.any(ZodType),
              signature: expect.any(ZodType),
            },
          }),
          response: expect.objectContaining({
            200: expect.any(ZodType),
            400: expect.any(ZodType),
            401: expect.any(ZodType),
            409: expect.any(ZodType),
          }),
        }),
        preValidation: [checkSignature],
        preHandler: [saveFederationEvent("FEDERATION_TRANSFER_INIT")],
        handler: expect.any(Function),
      }),
    );
  });
});
