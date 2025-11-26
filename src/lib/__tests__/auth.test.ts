import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock server-only to prevent client-side import error
vi.mock("server-only", () => ({}));

// Create mock objects
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock jose with a working chain
vi.mock("jose", () => {
  const mockInstance = {
    setProtectedHeader: vi.fn(),
    setExpirationTime: vi.fn(),
    setIssuedAt: vi.fn(),
    sign: vi.fn().mockResolvedValue("mocked-jwt-token"),
  };

  // Each method returns the instance for chaining
  mockInstance.setProtectedHeader.mockReturnValue(mockInstance);
  mockInstance.setExpirationTime.mockReturnValue(mockInstance);
  mockInstance.setIssuedAt.mockReturnValue(mockInstance);

  return {
    SignJWT: vi.fn(() => mockInstance),
    jwtVerify: vi.fn(),
  };
});

// Import after mocking
import { createSession } from "../auth";

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  test("creates session successfully", async () => {
    const userId = "test-user";
    const email = "test@example.com";

    await expect(createSession(userId, email)).resolves.not.toThrow();
  });

  test("sets cookie with correct name and basic options", async () => {
    const userId = "user-123";
    const email = "user@test.com";

    await createSession(userId, email);

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      "mocked-jwt-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        expires: expect.any(Date),
      })
    );
  });

  test("sets secure cookie option based on environment", async () => {
    // Test production environment
    process.env.NODE_ENV = "production";
    await createSession("user1", "email1@test.com");

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      "mocked-jwt-token",
      expect.objectContaining({
        secure: true,
      })
    );

    vi.clearAllMocks();

    // Test development environment
    process.env.NODE_ENV = "development";
    await createSession("user2", "email2@test.com");

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      "mocked-jwt-token",
      expect.objectContaining({
        secure: false,
      })
    );
  });

  test("creates JWT with session payload", async () => {
    const userId = "payload-user";
    const email = "payload@example.com";

    await createSession(userId, email);

    const { SignJWT } = await import("jose");
    expect(SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        email,
        expiresAt: expect.any(Date),
      })
    );
  });

  test("sets expiration date approximately 7 days in future", async () => {
    const beforeTime = Date.now();
    await createSession("time-user", "time@test.com");
    const afterTime = Date.now();

    const setCookieCall = mockCookieStore.set.mock.calls[0];
    const cookieOptions = setCookieCall[2];
    const expiresDate = cookieOptions.expires;

    // Check it's approximately 7 days (within 2 seconds tolerance)
    const expectedExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const actualExpiry = expiresDate.getTime() - beforeTime;

    expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 2000);
    expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 2000);
  });

  test("handles empty user data", async () => {
    await expect(createSession("", "")).resolves.not.toThrow();

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      "mocked-jwt-token",
      expect.any(Object)
    );
  });

  test("handles special characters in user data", async () => {
    const specialUserId = "user@#$%^&*()";
    const specialEmail = "special+chars@test-domain.co.uk";

    await expect(createSession(specialUserId, specialEmail)).resolves.not.toThrow();

    const { SignJWT } = await import("jose");
    expect(SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: specialUserId,
        email: specialEmail,
      })
    );
  });
});