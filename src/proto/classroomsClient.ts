import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./generated/classrooms/classrooms";

const classroomsDef = protoLoader.loadSync("proto/classrooms.proto", {
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});
const classroomsPackageDef = grpc.loadPackageDefinition(classroomsDef) as unknown as ProtoGrpcType;

if (process.env.CLASSROOM_SERVICE_URL_GRPC == null) {
  console.error("Classroom service gRPC URL is not set");
  process.exit(101);
}

const client = new classroomsPackageDef.ClassroomService(
  process.env.CLASSROOM_SERVICE_URL_GRPC,
  grpc.credentials.createInsecure()
);

export default client;
