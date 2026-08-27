import { describe, expect, it } from "vitest";
import { configuredPdfHosts, isPrivateIp, validatePdfSourceUrl } from "./source-security";

describe("publisher PDF allowlist", () => {
  it("allows arXiv and explicitly configured publisher hosts", () => {
    expect(validatePdfSourceUrl("https://arxiv.org/pdf/2401.00001.pdf").hostname).toBe("arxiv.org");
    expect(validatePdfSourceUrl("https://papers.example.org/article.pdf", configuredPdfHosts("papers.example.org")).hostname).toBe("papers.example.org");
  });
  it.each(["http://arxiv.org/a.pdf", "https://user:pass@arxiv.org/a.pdf", "https://arxiv.org:8443/a.pdf", "https://evil.example/a.pdf", "https://127.0.0.1/a.pdf"])("rejects unsafe source %s", (source) => expect(() => validatePdfSourceUrl(source)).toThrow());
  it.each(["127.0.0.1", "10.0.0.2", "169.254.1.2", "192.168.1.1", "100.64.0.1", "198.18.0.1", "::ffff:127.0.0.1", "::1", "fd00::1", "ff02::1"])("recognizes private address %s", (address) => expect(isPrivateIp(address)).toBe(true));
});
