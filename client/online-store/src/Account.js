import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const listeners = [];
export const account = {
  data: null,
  isLoading: false,
  isError: false,
  setData: function(value) {
    this.data = value;
    for(const obj of listeners)
      obj.setData(value);
  },
  setLoading: function(value) {
    this.isLoading = value;
    for(const obj of listeners)
      obj.setLoading(value);
  },
  setError: function(value) {
    this.isError = value;
    for(const obj of listeners)
      obj.setError(value);
  }
};

export async function fetchUserData(userid, password) {
  if(userid === undefined)
    userid = Cookies.get("userid");
  if(password === undefined)
    password = Cookies.get("password");
  if(userid === undefined || password === undefined)
    return

  account.setLoading(true);
  account.setError(false);
  try {
    const response = await fetch(`/users/${userid}?${new URLSearchParams({ password })}`);
    if(response.ok) {
      if(account.isLoading) {
        account.setData(await response.json());
        Cookies.set("userid", userid);
        Cookies.set("password", password);
      }
    }
    else {
      throw new Error(response.statusText);
    }
  }
  catch(e) {
    console.log(e);
    account.setError(true);
    Cookies.remove("userid");
    Cookies.remove("password");
  }
  account.setLoading(false);
}

export function clearUserData() {
  account.setData(null);
  account.setLoading(false);
  account.setError(false);
  Cookies.remove("userid");
  Cookies.remove("password");
}

export function useAccount() {
  const [data, setData] = useState(account.data);
  const [isLoading, setLoading] = useState(account.isLoading);
  const [isError, setError] = useState(account.isError);
  const handleFetch = () => {
    if(!account.data && !account.isLoading)
      fetchUserData();
  }
  useEffect(() => {
    const obj = { setData, setLoading, setError };
    listeners.push(obj);
    handleFetch();
    return () => {
      listeners.splice(listeners.indexOf(obj), 1);
    } 
  }, []);
  return { data, isLoading, isError };
}