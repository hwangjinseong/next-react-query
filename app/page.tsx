"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useThrottling } from "../hook";

async function getItems(page: number, limit: number) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/comments?_page=${page}&_limit=${limit}`
  );

  const data = await response.json();

  return {
    page: page,
    list: data as Item[],
  };
}

function Home() {
  const limit = 30;

  const loading = useRef<boolean>(false);

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery<APIResponse>({
    queryKey: ["home-data-list"],
    queryFn: ({ pageParam }) => getItems(pageParam as number, limit),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return lastPage.list.length === 0 ? undefined : nextPage;
    },
    initialPageParam: 1,
  });

  const handleScroll = useThrottling(async () => {
    const { scrollTop, offsetHeight } = document.documentElement;

    console.log(loading.current);
    if (hasNextPage && scrollTop >= offsetHeight - window.innerHeight - 3000) {
      if (loading.current === false) {
        loading.current = true;
        await fetchNextPage();
        loading.current = false;
      }
    }
  });

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data, loading]);

  const dataList = data?.pages
    .map((item) => item.list.map((itemList) => itemList))
    .flat();

  return (
    <div>
      {dataList?.map((item) => (
        <div key={item.id}>
          <li>
            postId : {item.postId}
            <ol>id : {item.id}</ol>
            <ol>name : {item.name}</ol>
            <ol>email : {item.email}</ol>
            <ol>body : {item.body}</ol>
          </li>
        </div>
      ))}
    </div>
  );
}

export default Home;