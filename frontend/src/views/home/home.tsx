// import React from "react";
// // import { BrowserRouter as Router, Route} from "react-router-dom";
// import MyNavBar from "../../hooks/navbar/navbar";
// import QueryTest from "./Nick";

// function MyHomePage() {
// 	return (
// 		<div>
// 			<MyNavBar />
// 			<QueryTest />
// 		</div>
// 	)
// }

// export default MyHomePage()

import React from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import QueryTest from "./Nick";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

const queryClient = new QueryClient();

function MyHomePage() {
  return (
    <div>
      <MyNavBar />
      <QueryClientProvider client={queryClient}>
          <QueryTest />
      </QueryClientProvider>
    </div>
  );
}

export default MyHomePage;