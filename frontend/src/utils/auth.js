export const getToken =
  () =>
    localStorage.getItem(
      "token"
    ) ||
    localStorage.getItem(
      "authToken"
    );


export const setToken =
  token => {

    if (
      token
    ) {

      localStorage.setItem(
        "token",
        token
      );

    }

  };


export const clearAuth =
  () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "authToken"
    );

    localStorage.removeItem(
      "user"
    );

  };


export const getStoredUser =
  () => {

    const raw =
      localStorage.getItem(
        "user"
      );


    if (
      !raw
    ) {

      return null;

    }


    try {

      return JSON.parse(
        raw
      );

    } catch {

      return null;

    }

  };


export const getRole =
  () => {

    const user =
      getStoredUser();


    return (
      user?.role ||
      user?.Role ||
      ""
    );

  };


export const isAuthenticated =
  () =>
    Boolean(
      getToken()
    );


export default {
  getToken,
  setToken,
  clearAuth,
  getStoredUser,
  getRole,
  isAuthenticated,
};
