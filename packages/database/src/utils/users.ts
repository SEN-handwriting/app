import { db } from "../client";
import { Prisma } from "@prisma/client";

export async function createUser(user: Prisma.UserCreateArgs["data"]) {
  return db.user.create({ data: user });
}

export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

export async function changeUsername(userId: string, username: string) {
  return db.user.update({
    where: { id: userId },
    data: { username },
  });
}

export async function changeProfilePicture(userId: string, url: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      profilePictureUrl: url,
    },
  });
}
