export function dateFormatter(dateString) {
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const month = date.toLocaleString("default", {
    month: "long",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();

  const suffix = ((d) =>
    d > 3 && d < 21 ? "th" : ["th", "st", "nd", "rd"][d % 10] || "th")(day);

  return `${day}${suffix} ${month} ${year}`;
}

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
