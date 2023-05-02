import React from 'react';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

function PrintToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code')
//   https://api.intra.42.fr/apidoc/guides/web_application_flow
  return (
	<div>
		<p>{code}</p>
	</div>
  )
}

function MyLoginPage() {
  return (
    <div>
		<h1> So, You're Trying to Log in huh?</h1>
		<PrintToken />
	</div>
  );
}

export default MyLoginPage;