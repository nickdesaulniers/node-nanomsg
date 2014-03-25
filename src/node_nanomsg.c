#include <shim.h>

#include <nanomsg/nn.h>
#include <nanomsg/pubsub.h>
#include <nanomsg/pipeline.h>
#include <nanomsg/bus.h>
#include <nanomsg/pair.h>
#include <nanomsg/reqrep.h>


#define shim_obj_set_constant(C, O, N) shim_obj_set_prop_name(C, O, #N, shim_integer_uint(C, N))


static shim_bool_t
Foobar(shim_ctx_t* ctx, shim_args_t* args)
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
Socket(shim_ctx_t* ctx, shim_args_t* args)
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
	if(protocol == NN_SUB)
    	if (nn_setsockopt(domain, NN_SUB, NN_SUB_SUBSCRIBE, "", 0) != 0)
    		return FALSE;

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
Close(shim_ctx_t* ctx, shim_args_t* args)
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
Setsockopt(shim_ctx_t* ctx, shim_args_t* args)
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
Getsockopt(shim_ctx_t* ctx, shim_args_t* args)
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
Bind(shim_ctx_t* ctx, shim_args_t* args)
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
Connect(shim_ctx_t* ctx, shim_args_t* args)
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
Shutdown(shim_ctx_t* ctx, shim_args_t* args)
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

#include <stdio.h>


static shim_bool_t
Send(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	shim_val_t* buf = NULL;
	int flags = 0;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_BUFFER, &buf,
			SHIM_TYPE_INT32, &flags,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Unpack buffer explicitly because of issues.
  char* odata;
  buf = shim_args_get(args, 1);
  if (!shim_unpack_type(ctx, buf, SHIM_TYPE_BUFFER, &odata))
    return FALSE;
 	size_t odata_len = shim_buffer_length(buf);

	// Invoke nanomsg function.
	int ret = nn_send	(s, odata, odata_len, flags);

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
Recv(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;
	int flags = 0;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
			SHIM_TYPE_INT32, &flags,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Invoke nanomsg function.
	void *retbuf = NULL;
	int ret = nn_recv(s, &retbuf, NN_MSG, flags);

	if (ret > -1) {
		shim_args_set_rval(ctx, args, shim_buffer_new_copy(ctx, retbuf, ret));
	} else {
		shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
	}
  return TRUE;
}


static shim_bool_t
Errno(shim_ctx_t* ctx, shim_args_t* args)
{
	// Invoke nanomsg function.
	int ret = nn_errno ();

	shim_args_set_rval(ctx, args, shim_integer_new(ctx, ret));
  return TRUE;
}


static shim_bool_t
Strerr(shim_ctx_t* ctx, shim_args_t* args)
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


#include <unistd.h>

static shim_bool_t
Usleep(shim_ctx_t* ctx, shim_args_t* args)
{
	int s = -1;

	if (!shim_unpack(ctx, args,
			SHIM_TYPE_INT32, &s,
	    SHIM_TYPE_UNKNOWN))
		return (FALSE);

	// Unpack buffer explicitly because of issues.
  usleep(s);

  return TRUE;
}


shim_bool_t
myinit(shim_ctx_t* ctx, shim_val_t* exports, shim_val_t* module)
{
  // Wrap C functions
  shim_fspec_t funcs[] = {
    SHIM_FS(Foobar),

    SHIM_FS(Socket),
    SHIM_FS(Close),
    SHIM_FS(Setsockopt),
    SHIM_FS(Getsockopt),
    SHIM_FS(Bind),
    SHIM_FS(Connect),
    SHIM_FS(Shutdown),
    SHIM_FS(Send),
    SHIM_FS(Recv),
    SHIM_FS(Errno),
    SHIM_FS(Strerr),

    SHIM_FS(Usleep),
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