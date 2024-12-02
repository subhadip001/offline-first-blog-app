import { cn, formatRelativeTime } from "../utils";

describe("cn function", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", { bar: true })).toBe("foo bar");
    expect(cn("foo", { bar: false })).toBe("foo");
    expect(cn("foo", ["bar", "baz"])).toBe("foo bar baz");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-03-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "Just now" for times less than a minute ago', () => {
    const date = new Date("2024-03-15T11:59:30Z");
    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it("should return minutes for times less than an hour ago", () => {
    const date = new Date("2024-03-15T11:30:00Z");
    expect(formatRelativeTime(date)).toBe("30 minutes ago");
  });

  it("should return hours for times less than a day ago", () => {
    const date = new Date("2024-03-15T08:00:00Z");
    expect(formatRelativeTime(date)).toBe("4 hours ago");
  });

  it('should return "Yesterday" for times between 24 and 48 hours ago', () => {
    const date = new Date("2024-03-14T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("Yesterday");
  });

  it("should return days for times less than a month ago", () => {
    const date = new Date("2024-03-10T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("5 days ago");
  });

  it("should return months for times less than a year ago", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2 months ago");
  });

  it("should return years for times more than a year ago", () => {
    const date = new Date("2022-03-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2 years ago");
  });
});
