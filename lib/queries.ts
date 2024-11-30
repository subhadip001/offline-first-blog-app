export enum QueryKeys {
  POSTS = "posts",
}

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  return token;
};

const fechData = async (url: string) => {
  const token = getAccessToken();
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch data");
  }
  return res.json();
};

const postData = async (url: string, data: any) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export async function fetchPosts() {
  const data = await fechData("/api/posts");
  return data.posts;
}
