import React from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import QueryTest from "./mainstats";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import MyAchievement from '../profile/achievement';

const queryClient = new QueryClient();

function MyHomePage() {
  return (
    <div>
      <MyNavBar />
      {/* <QueryClientProvider client={queryClient}>
          <QueryTest />
      </QueryClientProvider> */}
      <MyAchievement />
    </div>
  );
}

export default MyHomePage;