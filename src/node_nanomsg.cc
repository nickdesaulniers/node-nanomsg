#include <stdio.h>
#include <stdlib.h>
#include <node.h>
#include "nan.h"

#include <nn.h>
#include <pubsub.h>
#include <pipeline.h>
#include <bus.h>
#include <pair.h>
#include <reqrep.h>
#include <survey.h>
#include <inproc.h>
#include <ipc.h>
#include <tcp.h>

using namespace v8;


NAN_METHOD(Socket) {
    NanScope();

    int domain = args[0]->Uint32Value();
    int protocol = args[1]->Uint32Value();

    // Invoke nanomsg function.
    int ret = nn_socket(domain, protocol);

    if(protocol == NN_SUB) {
        if (nn_setsockopt(domain, NN_SUB, NN_SUB_SUBSCRIBE, "", 0) != 0) {
            return NanThrowError("Could not set subscribe option.");
        }
    }

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Close) {
    NanScope();

    int s = args[0]->Uint32Value();

    // Invoke nanomsg function.
    int ret = nn_close(s);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Setsockopt) {
    NanScope();

    int s = args[0]->Uint32Value();
    int level = args[1]->Uint32Value();
    int option = args[2]->Uint32Value();
    int ret;

    switch(option) {
        /* string setters */
        case NN_SOCKET_NAME:
            {
                size_t str_len = 0;
                char *str = NanCString(args[3], &str_len);

                // Invoke nanomsg function.
                ret = nn_setsockopt(s, level, option, str, str_len);
            }
            break;

        /* int setters */
        default:
            {
                int optval = args[3]->Uint32Value();

                // Invoke nanomsg function.
                ret = nn_setsockopt(s, level, option, &optval, sizeof(optval));
            }
            break;
    }

    NanReturnValue(Number::New(ret));
}


// returns an array n where:
// n[0] is the return code (0 good, negative bad)
// n[1] is an int or string representing the option's value
NAN_METHOD(Getsockopt) {
    NanScope();

    int s = args[0]->Uint32Value();
    int level = args[1]->Uint32Value();
    int option = args[2]->Uint32Value();
    //int optval = args[3]->Uint32Value();
    int optval[64];

    // Invoke nanomsg function.
    size_t optsize = sizeof(optval);
    int ret = nn_getsockopt(s, level, option, optval, &optsize);

    Local<Array> obj = Array::New(2);
    obj->Set(0, Number::New(ret));

    if(ret == 0) {
        switch(option) {
            /* string return values */
            case NN_SOCKET_NAME:
                obj->Set(1, String::New((char *)optval));
                break;

            /* int return values */
            default:
                obj->Set(1, Number::New(optval[0]));
                break;
        }
    }

    // otherwise pass the error back
    NanReturnValue(obj);
}


NAN_METHOD(Bind) {
    NanScope();

    int s = args[0]->Uint32Value();
    size_t addr_len = 0;
    char* addr = NanCString(args[1], &addr_len);

    // Invoke nanomsg function.
    int ret = nn_bind(s, addr);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Connect) {
    NanScope();

    int s = args[0]->Uint32Value();
    size_t addr_len = 0;
    char* addr = NanCString(args[1], &addr_len);

    // Invoke nanomsg function.
    int ret = nn_connect(s, addr);

    NanReturnValue(Number::New(ret));
}

NAN_METHOD(Shutdown) {
    NanScope();

    int s = args[0]->Uint32Value();
    int how = args[1]->Uint32Value();

    // Invoke nanomsg function.
    int ret = nn_shutdown(s, how);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Send) {
    NanScope();

    int s = args[0]->Uint32Value();

    if(!node::Buffer::HasInstance(args[1])) {
        return NanThrowError("second Argument must be a Buffer.");
    }

    Local<Object> obj = args[1]->ToObject();
    char* odata = node::Buffer::Data(obj);
    size_t odata_len = node::Buffer::Length(obj);
    int flags = args[2]->Uint32Value();

    // Invoke nanomsg function.
    int ret = nn_send(s, odata, odata_len, flags);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Recv) {
    NanScope();

    int s = args[0]->Uint32Value();
    int flags = args[1]->Uint32Value();

    // Invoke nanomsg function.
    void *retbuf = NULL;
    int ret = nn_recv(s, &retbuf, NN_MSG, flags);

    // TODO multiple return args
    if(ret > -1) {
        NanReturnValue(NanNewBufferHandle((char*) retbuf, ret));
    } else {
        NanReturnValue(Number::New(ret));
    }
}

NAN_METHOD(SymbolInfo) {
    NanScope();

    int s = args[0]->Uint32Value();
    struct nn_symbol_properties prop;
    int ret = nn_symbol_info(s, &prop, sizeof(prop));

    if(ret > 0) {
        Local<Object> obj = Object::New();
        obj->Set(String::NewSymbol("value"), Number::New(prop.value));
        obj->Set(String::NewSymbol("ns"), Number::New(prop.ns));
        obj->Set(String::NewSymbol("type"), Number::New(prop.type));
        obj->Set(String::NewSymbol("unit"), Number::New(prop.unit));
        obj->Set(String::NewSymbol("name"), String::New(prop.name));
        NanReturnValue(obj);
    }
    else if(ret == 0) {
        // symbol index out of range
        NanReturnUndefined();
    } else {
        return NanThrowError(nn_strerror(nn_errno()));
    }
}

NAN_METHOD(Symbol) {
    NanScope();

    int s = args[0]->Uint32Value();
    int val;
    const char *ret = nn_symbol(s, &val);

    if(ret) {
        Local<Object> obj = Object::New();
        obj->Set(String::NewSymbol("value"), Number::New(val));
        obj->Set(String::NewSymbol("name"), String::New(ret));
        NanReturnValue(obj);
    } else {
        // symbol index out of range
        // this behaviour seems inconsistent with SymbolInfo() above
        // but we are faithfully following the libnanomsg API, warta and all
        return NanThrowError(nn_strerror(nn_errno())); // EINVAL
    }
}

NAN_METHOD(Term) {
    NanScope();
    nn_term();
    NanReturnUndefined();
}

NAN_METHOD(Errno) {
    NanScope();

    // Invoke nanomsg function.
    int ret = nn_errno();

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Strerr) {
    NanScope();

    int errnum = args[0]->Uint32Value();

    // Invoke nanomsg function.
    const char* err = nn_strerror(errnum);

    NanReturnValue(String::New(err));
}

NAN_METHOD(NonblockingPoll) {
    NanScope();

    int sock = args[0]->Uint32Value();
    int events = args[1]->Uint32Value();
    struct nn_pollfd fd = { 0, 0, 0 };

    fd.fd = sock;
    fd.events = events;

    int rval = nn_poll(&fd, 1, 0); // non-blocking

    if(rval < 0) {
        NanReturnValue(Number::New(0 - nn_errno()));
    } else {
        NanReturnValue(Number::New(fd.revents));
    }
}


#define EXPORT_METHOD(C, S) C->Set(NanSymbol(# S), FunctionTemplate::New(S)->GetFunction());
#define EXPORT_CONSTANT(C, S) C->Set(NanSymbol(# S), Number::New(S));

void InitAll(Handle<Object> exports) {
    // Export functions.
    EXPORT_METHOD(exports, Socket);
    EXPORT_METHOD(exports, Close);
    EXPORT_METHOD(exports, Setsockopt);
    EXPORT_METHOD(exports, Getsockopt);
    EXPORT_METHOD(exports, Bind);
    EXPORT_METHOD(exports, Connect);
    EXPORT_METHOD(exports, Shutdown);
    EXPORT_METHOD(exports, Send);
    EXPORT_METHOD(exports, Recv);
    EXPORT_METHOD(exports, Errno);
    EXPORT_METHOD(exports, Strerr);
    EXPORT_METHOD(exports, NonblockingPoll);
    EXPORT_METHOD(exports, SymbolInfo);
    EXPORT_METHOD(exports, Symbol);
    EXPORT_METHOD(exports, Term);

    // symbol namespaces
    EXPORT_CONSTANT(exports, NN_NS_NAMESPACE);
    EXPORT_CONSTANT(exports, NN_NS_VERSION);
    EXPORT_CONSTANT(exports, NN_NS_DOMAIN);
    EXPORT_CONSTANT(exports, NN_NS_TRANSPORT);
    EXPORT_CONSTANT(exports, NN_NS_PROTOCOL);
    EXPORT_CONSTANT(exports, NN_NS_OPTION_LEVEL);
    EXPORT_CONSTANT(exports, NN_NS_SOCKET_OPTION);
    EXPORT_CONSTANT(exports, NN_NS_TRANSPORT_OPTION);
    EXPORT_CONSTANT(exports, NN_NS_OPTION_TYPE);
    EXPORT_CONSTANT(exports, NN_NS_OPTION_UNIT); // not in symbol.c, but is in nn.h
    EXPORT_CONSTANT(exports, NN_NS_FLAG);
    EXPORT_CONSTANT(exports, NN_NS_ERROR);
    EXPORT_CONSTANT(exports, NN_NS_LIMIT);

    // symbol types
    EXPORT_CONSTANT(exports, NN_TYPE_NONE);
    EXPORT_CONSTANT(exports, NN_TYPE_INT);
    EXPORT_CONSTANT(exports, NN_TYPE_STR);

    // symbol units
    EXPORT_CONSTANT(exports, NN_UNIT_NONE);
    EXPORT_CONSTANT(exports, NN_UNIT_BYTES);
    EXPORT_CONSTANT(exports, NN_UNIT_MILLISECONDS);
    EXPORT_CONSTANT(exports, NN_UNIT_PRIORITY);
    EXPORT_CONSTANT(exports, NN_UNIT_BOOLEAN);

    // Versions
    EXPORT_CONSTANT(exports, NN_VERSION_CURRENT);
    EXPORT_CONSTANT(exports, NN_VERSION_REVISION);
    EXPORT_CONSTANT(exports, NN_VERSION_AGE);

    // Domains
    EXPORT_CONSTANT(exports, AF_SP);
    EXPORT_CONSTANT(exports, AF_SP_RAW);

    // Transports
    EXPORT_CONSTANT(exports, NN_INPROC);
    EXPORT_CONSTANT(exports, NN_IPC);
    EXPORT_CONSTANT(exports, NN_TCP);

    // Protocols
    EXPORT_CONSTANT(exports, NN_PAIR);
    EXPORT_CONSTANT(exports, NN_PUB);
    EXPORT_CONSTANT(exports, NN_SUB);
    EXPORT_CONSTANT(exports, NN_REP);
    EXPORT_CONSTANT(exports, NN_REQ);
    EXPORT_CONSTANT(exports, NN_PUSH);
    EXPORT_CONSTANT(exports, NN_PULL);
    EXPORT_CONSTANT(exports, NN_SURVEYOR);
    EXPORT_CONSTANT(exports, NN_RESPONDENT);
    EXPORT_CONSTANT(exports, NN_BUS);

    // Limits
    EXPORT_CONSTANT(exports, NN_SOCKADDR_MAX); // max length of a socket address

    // Socket option levels: Negative numbers are reserved for transports,
    // positive for socket types.
    EXPORT_CONSTANT(exports, NN_SOL_SOCKET);

    //  Generic socket options (NN_SOL_SOCKET level).
    EXPORT_CONSTANT(exports, NN_LINGER);
    EXPORT_CONSTANT(exports, NN_SNDBUF);
    EXPORT_CONSTANT(exports, NN_RCVBUF);
    EXPORT_CONSTANT(exports, NN_SNDTIMEO);
    EXPORT_CONSTANT(exports, NN_RCVTIMEO);
    EXPORT_CONSTANT(exports, NN_RECONNECT_IVL);
    EXPORT_CONSTANT(exports, NN_RECONNECT_IVL_MAX);
    EXPORT_CONSTANT(exports, NN_SNDPRIO);
    EXPORT_CONSTANT(exports, NN_SNDFD);
    EXPORT_CONSTANT(exports, NN_RCVFD);
    EXPORT_CONSTANT(exports, NN_DOMAIN);
    EXPORT_CONSTANT(exports, NN_PROTOCOL);
    EXPORT_CONSTANT(exports, NN_IPV4ONLY);
    EXPORT_CONSTANT(exports, NN_SOCKET_NAME);

    // transport options
    EXPORT_CONSTANT(exports, NN_SUB_SUBSCRIBE);
    EXPORT_CONSTANT(exports, NN_SUB_UNSUBSCRIBE);
    EXPORT_CONSTANT(exports, NN_REQ_RESEND_IVL);
    EXPORT_CONSTANT(exports, NN_SURVEYOR_DEADLINE);
    EXPORT_CONSTANT(exports, NN_TCP_NODELAY);

    // Flags
    EXPORT_CONSTANT(exports, NN_DONTWAIT);

    // Errors
    EXPORT_CONSTANT(exports, EADDRINUSE);
    EXPORT_CONSTANT(exports, EADDRNOTAVAIL);
    EXPORT_CONSTANT(exports, EAFNOSUPPORT);
    EXPORT_CONSTANT(exports, EAGAIN);
    EXPORT_CONSTANT(exports, EBADF);
    EXPORT_CONSTANT(exports, ECONNREFUSED);
    EXPORT_CONSTANT(exports, EFAULT);
    EXPORT_CONSTANT(exports, EFSM);
    EXPORT_CONSTANT(exports, EINPROGRESS);
    EXPORT_CONSTANT(exports, EINTR);
    EXPORT_CONSTANT(exports, EINVAL);
    EXPORT_CONSTANT(exports, EMFILE);
    EXPORT_CONSTANT(exports, ENAMETOOLONG);
    EXPORT_CONSTANT(exports, ENETDOWN);
    EXPORT_CONSTANT(exports, ENOBUFS);
    EXPORT_CONSTANT(exports, ENODEV);
    EXPORT_CONSTANT(exports, ENOMEM);
    EXPORT_CONSTANT(exports, ENOPROTOOPT);
    EXPORT_CONSTANT(exports, ENOTSOCK);
    EXPORT_CONSTANT(exports, ENOTSUP);
    EXPORT_CONSTANT(exports, EPROTO);
    EXPORT_CONSTANT(exports, EPROTONOSUPPORT);
    EXPORT_CONSTANT(exports, ETERM);
    EXPORT_CONSTANT(exports, ETIMEDOUT);
    EXPORT_CONSTANT(exports, EACCES);
    EXPORT_CONSTANT(exports, ECONNABORTED);
    EXPORT_CONSTANT(exports, ECONNRESET);
    EXPORT_CONSTANT(exports, EHOSTUNREACH);
    EXPORT_CONSTANT(exports, EMSGSIZE);
    EXPORT_CONSTANT(exports, ENETRESET);
    EXPORT_CONSTANT(exports, ENETUNREACH);
    EXPORT_CONSTANT(exports, ENOTCONN);
    EXPORT_CONSTANT(exports, EISCONN); // not in symbol.c, but is in nn.h

    // Polling - these aren't in symbol.c but they are in nn.h
    EXPORT_CONSTANT(exports, NN_POLLIN);
    EXPORT_CONSTANT(exports, NN_POLLOUT);
}

NODE_MODULE(node_nanomsg, InitAll)
