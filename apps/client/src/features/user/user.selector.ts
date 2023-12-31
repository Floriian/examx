import { RootState } from "@/app";
import { createSelector } from "@reduxjs/toolkit";

function rootSelector(state: RootState) {
  return state.user;
}

export const getUser = createSelector(rootSelector, (state) => state);
