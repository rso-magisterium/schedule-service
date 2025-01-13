import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import prisma from "../prisma";

import { ProtoGrpcType } from "./generated/schedule/schedule";
import { ScheduleServiceHandlers } from "./generated/schedule/ScheduleService";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import logger from "../logger";

const scheduleDef = protoLoader.loadSync("proto/schedule.proto", {
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});
const schedulePackageDef = grpc.loadPackageDefinition(scheduleDef) as unknown as ProtoGrpcType;

const scheduleServiceHandlers: ScheduleServiceHandlers = {
  Create: async (call, callback) => {
    const { tenantId, classroom, start, end, repeat, repeatEnd } = call.request;

    if (!tenantId || !classroom || !start || !end || !repeat) {
      logger.debug({
        request: { service: "ScheduleService", function: "Create", request: call.request },
        error: "Missing required fields",
      });
      callback({ code: grpc.status.INVALID_ARGUMENT, message: "Missing required fields" });
      return;
    }

    console.log(new Date(start));
    try {
      const entry = await prisma.scheduleEntry.create({
        data: {
          tenantId,
          classroom,
          start: new Date(start),
          end: new Date(end),
          repeat: repeat,
          repeatEnd: repeatEnd ? new Date(repeatEnd) : undefined,
        },
      });

      if (!entry) {
        logger.debug({
          request: { service: "ScheduleService", function: "Create", request: call.request },
          error: "Failed to create schedule entry",
        });
        callback({ code: grpc.status.INTERNAL, message: "Failed to create schedule entry" });
        return;
      }

      logger.info(
        { request: { service: "ScheduleService", function: "Create", request: call.request } },
        "Created schedule entry"
      );
      callback(null, {
        id: entry.id,
        tenantId: entry.tenantId,
        classroom: entry.classroom,
        start: entry.start.getTime(),
        end: entry.end.getTime(),
        repeat: entry.repeat,
        repeatEnd: entry.repeatEnd?.getTime(),
        createdAt: entry.createdAt.getTime(),
        updatedAt: entry.updatedAt.getTime(),
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        logger.error(
          { request: { service: "ScheduleService", function: "Create", request: call.request }, error: err },
          "Prisma error"
        );
        callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: `${err.code}: ${err.message}`,
          details: JSON.stringify(err.meta),
        });
      } else if (err instanceof PrismaClientValidationError) {
        logger.error(
          { request: { service: "ScheduleService", function: "Create", request: call.request }, error: err },
          "Prisma error"
        );
        callback({ code: grpc.status.INVALID_ARGUMENT, message: `${err.message}` });
      } else {
        logger.error(
          { request: { service: "ScheduleService", function: "Create", request: call.request }, error: err },
          "Prisma error"
        );
        callback({ code: grpc.status.INTERNAL, message: "Unknown error", details: JSON.stringify(err) });
      }
    }
  },
  Read: async (call, callback) => {
    const { id } = call.request;

    if (!id) {
      logger.debug(
        { request: { service: "ScheduleService", function: "Read", request: call.request } },
        "Missing required fields"
      );
      callback({ code: grpc.status.INVALID_ARGUMENT, message: "Missing required fields" });
      return;
    }

    const entry = await prisma.scheduleEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      logger.debug(
        { request: { service: "ScheduleService", function: "Read", request: call.request } },
        "Schedule entry not found"
      );
      callback({ code: grpc.status.NOT_FOUND, message: "Schedule entry not found" });
      return;
    }

    logger.info(
      { request: { service: "ScheduleService", function: "Read", request: call.request } },
      "Read schedule entry"
    );
    callback(null, {
      id: entry.id,
      tenantId: entry.tenantId,
      classroom: entry.classroom,
      start: entry.start.getTime(),
      end: entry.end.getTime(),
      repeat: entry.repeat,
      repeatEnd: entry.repeatEnd?.getTime(),
      createdAt: entry.createdAt.getTime(),
      updatedAt: entry.updatedAt.getTime(),
    });
  },
  Update: async (call, callback) => {
    const { id, tenantId, classroom, start, end, repeat, repeatEnd } = call.request;

    if (!id || !tenantId || !classroom || !start || !end || !repeat) {
      logger.debug({
        request: { service: "ScheduleService", function: "Update", request: call.request },
        error: "Missing required fields",
      });
      callback({ code: grpc.status.INVALID_ARGUMENT, message: "Missing required fields" });
      return;
    }

    const entry = await prisma.scheduleEntry.update({
      where: { id },
      data: {
        tenantId,
        classroom,
        start: new Date(start),
        end: new Date(end),
        repeat: repeat,
        repeatEnd: repeatEnd ? new Date(repeatEnd) : undefined,
      },
    });

    if (!entry) {
      logger.debug({
        request: { service: "ScheduleService", function: "Update", request: call.request },
        error: "Failed to update schedule entry",
      });
      callback({ code: grpc.status.INTERNAL, message: "Failed to update schedule entry" });
      return;
    }

    logger.info(
      { request: { service: "ScheduleService", function: "Update", request: call.request } },
      "Updated schedule entry"
    );
    callback(null, {
      id: entry.id,
      tenantId: entry.tenantId,
      classroom: entry.classroom,
      start: entry.start.getTime(),
      end: entry.end.getTime(),
      repeat: entry.repeat,
      repeatEnd: entry.repeatEnd?.getTime(),
      createdAt: entry.createdAt.getTime(),
      updatedAt: entry.updatedAt.getTime(),
    });
  },
  Delete: async (call, callback) => {
    const { id } = call.request;

    if (!id) {
      logger.debug(
        { request: { service: "ScheduleService", function: "Delete", request: call.request } },
        "Missing required fields"
      );
      callback({ code: grpc.status.INVALID_ARGUMENT, message: "Missing required fields" });
      return;
    }

    const entry = await prisma.scheduleEntry.delete({
      where: { id },
    });

    if (!entry) {
      logger.debug(
        { request: { service: "ScheduleService", function: "Delete", request: call.request } },
        "Schedule entry not found"
      );
      callback({ code: grpc.status.NOT_FOUND, message: "Schedule entry not found" });
      return;
    }

    logger.info(
      { request: { service: "ScheduleService", function: "Delete", request: call.request } },
      "Deleted schedule entry"
    );
    callback(null, {
      id: entry.id,
      tenantId: entry.tenantId,
      classroom: entry.classroom,
      start: entry.start.getTime(),
      end: entry.end.getTime(),
      repeat: entry.repeat,
      repeatEnd: entry.repeatEnd?.getTime(),
      createdAt: entry.createdAt.getTime(),
      updatedAt: entry.updatedAt.getTime(),
    });
  },
  List: async (call) => {
    const { tenantId, classroom } = call.request;

    if (!tenantId || !classroom) {
      logger.debug(
        { request: { service: "ScheduleService", function: "List", request: call.request } },
        "Missing required fields"
      );
      call.emit("error", { code: grpc.status.INVALID_ARGUMENT, message: "Missing required fields" });
      call.end();
      return;
    }

    const entries = await prisma.scheduleEntry.findMany({
      where: { tenantId, classroom },
    });

    logger.info(
      { request: { service: "ScheduleService", function: "List", request: call.request } },
      `Listed schedule entries (Count: ${entries.length})`
    );
    for (const entry of entries) {
      call.write({
        id: entry.id,
        tenantId: entry.tenantId,
        classroom: entry.classroom,
        start: entry.start.getTime(),
        end: entry.end.getTime(),
        repeat: entry.repeat,
        repeatEnd: entry.repeatEnd?.getTime(),
        createdAt: entry.createdAt.getTime(),
        updatedAt: entry.updatedAt.getTime(),
      });
    }

    call.end();
  },
};

const server = new grpc.Server();
server.addService(schedulePackageDef.ScheduleService.service, scheduleServiceHandlers);

export default server;
