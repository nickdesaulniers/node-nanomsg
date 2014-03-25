#include <shim.h>

#include <nanomsg/nn.h>
#include <nanomsg/pubsub.h>
#include <nanomsg/pipeline.h>
#include <nanomsg/bus.h>
#include <nanomsg/pair.h>
#include <nanomsg/reqrep.h>


#define shim_obj_set_constant(C, O, N) shim_obj_set_prop_name(C, O, #N, shim_integer_uint(C, N))


static shim_bool_t
foobar(shim_ctx_t* ctx, shim_args_t* args)
{
  /* create a new string with contents "Hello World" */
  shim_val_t* ret = shim_string_new_copy(ctx, "Hello World");
  /* set that string as the return value */
  shim_args_set_rval(ctx, args, ret);
  /* TRUE because this function didn't fail */
  return TRUE;
  /* If this were false, there probably would be an exception pending */
  /* shim_exception_pending() */
}


static shim_bool_t
socket(shim_ctx_t* ctx, shim_args_t* args)
{
	int domain = -1;
	int protocol = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &domain,
	    SHIM_TYPE_INT32, &protocol,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_socket(domain, protocol);

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
close(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_close(s);

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
setsockopt(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	int level = -1;
	int option = -1;
	int optval = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_INT32, &level,
			SHIM_TYPE_INT32, &option,
			SHIM_TYPE_INT32, &optval,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_setsockopt(s, level, option, &optval, sizeof(optval));

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
getsockopt(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	int level = -1;
	int option = -1;
	int optval = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_INT32, &level,
			SHIM_TYPE_INT32, &option,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	size_t optsize = sizeof(optval);
	int ret = nn_getsockopt(s, level, option, &optval, &optsize);

	shim_val_t* retarr = shim_array_new(ctx, 2);
	shim_array_set(ctx, retarr, 0, shim_integer_new(ctx, ret));
	shim_array_set(ctx, retarr, 1, shim_integer_new(ctx, optval));
	shim_args_set_rval(ctx, args, retarr);
  return TRUE;
}


static shim_bool_t
bind(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	shim_val_t *addr = NULL;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_STRING, &addr,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_bind(s, shim_string_value(addr));

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
connect(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	shim_val_t *addr = NULL;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_STRING, &addr,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_connect(s, shim_string_value(addr));

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
shutdown(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	int how = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_INT32, &how,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_shutdown(s, how);

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
send(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	shim_val_t* buf = NULL;
	int flags = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_BUFFER, &buf,
			SHIM_TYPE_INT32, &flags,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_send	(s, shim_buffer_value(buf), shim_buffer_length(buf), flags);

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
recv(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	shim_val_t* buf = NULL;
	int flags = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_BUFFER, &buf,
			SHIM_TYPE_INT32, &flags,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	int ret = nn_recv	(s, shim_buffer_value(buf), shim_buffer_length(buf), flags);

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
strerrno(shim_ctx_t* ctx, shim_args_t* args)
{
	// Invoke nanomsg function.
	int ret = nn_errno ();

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
strerr(shim_ctx_t* ctx, shim_args_t* args)
{
	int errnum = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &errnum,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	const char* err = nn_strerror (errnum);

	shim_args_set_rval(ctx, args, shim_string_new_copy(ctx, err));
  return TRUE;
}


shim_bool_t
myinit(shim_ctx_t* ctx, shim_val_t* exports, shim_val_t* module)
{
  // Wrap C functions
  shim_fspec_t funcs[] = {
    SHIM_FS(foobar),

    SHIM_FS(socket),
    SHIM_FS(close),
    SHIM_FS(setsockopt),
    SHIM_FS(getsockopt),
    SHIM_FS(bind),
    SHIM_FS(connect),
    SHIM_FS(shutdown),
    SHIM_FS(send),
    SHIM_FS(recv),
    SHIM_FS(strerrno),
    SHIM_FS(strerr),
    SHIM_FS_END,
  };
  
  // Add to exports.
  shim_obj_set_funcs(ctx, exports, funcs);

  // SP address families.
  shim_obj_set_constant(ctx, exports, AF_SP);
  shim_obj_set_constant(ctx, exports, AF_SP_RAW);

  // Socket option levels: Negative numbers are reserved for transports,
  // positive for socket types.
  shim_obj_set_constant(ctx, exports, NN_SOL_SOCKET);

  //  Generic socket options (NN_SOL_SOCKET level).
  shim_obj_set_constant(ctx, exports, NN_LINGER);
  shim_obj_set_constant(ctx, exports, NN_SNDBUF);
  shim_obj_set_constant(ctx, exports, NN_RCVBUF);
  shim_obj_set_constant(ctx, exports, NN_SNDTIMEO);
  shim_obj_set_constant(ctx, exports, NN_RCVTIMEO);
  shim_obj_set_constant(ctx, exports, NN_RECONNECT_IVL);
  shim_obj_set_constant(ctx, exports, NN_RECONNECT_IVL_MAX);
  shim_obj_set_constant(ctx, exports, NN_SNDPRIO);
  shim_obj_set_constant(ctx, exports, NN_SNDFD);
  shim_obj_set_constant(ctx, exports, NN_RCVFD);
  shim_obj_set_constant(ctx, exports, NN_DOMAIN);
  shim_obj_set_constant(ctx, exports, NN_PROTOCOL);
  shim_obj_set_constant(ctx, exports, NN_IPV4ONLY);

  // Send/recv options.
  shim_obj_set_constant(ctx, exports, NN_DONTWAIT);

  // Socket types
  shim_obj_set_constant(ctx, exports, NN_REQ);
  shim_obj_set_constant(ctx, exports, NN_REP);
  shim_obj_set_constant(ctx, exports, NN_PAIR);
  shim_obj_set_constant(ctx, exports, NN_PUSH);
  shim_obj_set_constant(ctx, exports, NN_PULL);
  shim_obj_set_constant(ctx, exports, NN_PUB);
  shim_obj_set_constant(ctx, exports, NN_SUB);
  shim_obj_set_constant(ctx, exports, NN_BUS);

  // Initialized successfully.
  return TRUE;
}


/*
 * Define a module `mymodule` whose initialization function is `myinit` which
 * will be called the first time the module is `require()`d.
 */
SHIM_MODULE(node_nanomsg, myinit)