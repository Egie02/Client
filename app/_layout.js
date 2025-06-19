import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import store from "./(redux)/store";
import AppWrapper from "./(redux)/AppWrapper";
import queryClient from "./(services)/queryClient";



export default function RootLayout() {
  return (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AppWrapper/>
    </QueryClientProvider>
  </Provider>
  );
}